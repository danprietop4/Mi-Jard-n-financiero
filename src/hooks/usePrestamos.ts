import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────
export type InterestType = "simple" | "compound";
export type LoanStatus = "vigente" | "vencido" | "pagado";

export interface Loan {
  id: string;
  debtor: string;               // Nombre de la persona
  principal: number;            // Monto prestado (P)
  remainingBalance: number;     // Saldo pendiente de capital
  interestRate: number;         // Tasa de interés (r) como decimal ej. 0.05 = 5%
  interestType: InterestType;   // Simple o Compuesto
  sourceAccount: string;        // Cuenta de origen (Mi Banco, Efectivo, etc.)
  startDate: string;            // Fecha de inicio (ISO)
  endDate: string;              // Fecha de vencimiento T (ISO)
  createdAt: string;            // Timestamp de creación
}

export interface LoanPayment {
  id: string;
  loanId: string;
  date: string;
  totalAmount: number;          // Monto total recibido
  principalPortion: number;     // Porción que reduce capital
  interestPortion: number;      // Porción que es ingreso por intereses
}

export interface LedgerEntry {
  id: string;
  loanId: string;
  date: string;
  type: "loan_disbursement" | "payment_received";
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  description: string;
}

// ── Interest Calculation ───────────────────────────────────────────────

/**
 * Simple interest: I = P × r × t
 * t is expressed in years (days / 365)
 */
export function calcSimpleInterest(principal: number, rate: number, days: number): number {
  const t = days / 365;
  return principal * rate * t;
}

/**
 * Compound interest: I = P × (1 + r)^t − P
 * t is expressed in years (days / 365)
 */
export function calcCompoundInterest(principal: number, rate: number, days: number): number {
  const t = days / 365;
  return principal * Math.pow(1 + rate, t) - principal;
}

export function calcInterest(principal: number, rate: number, days: number, type: InterestType): number {
  return type === "simple"
    ? calcSimpleInterest(principal, rate, days)
    : calcCompoundInterest(principal, rate, days);
}

/** Days between two ISO date strings */
function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.max(0, Math.floor((new Date(b).getTime() - new Date(a).getTime()) / msPerDay));
}

// ── Derived helpers ────────────────────────────────────────────────────

function getLoanStatus(loan: Loan, now: Date): LoanStatus {
  if (loan.remainingBalance <= 0) return "pagado";
  if (now > new Date(loan.endDate)) return "vencido";
  return "vigente";
}

function getProjectedInterest(loan: Loan): number {
  const days = daysBetween(loan.startDate, loan.endDate);
  return calcInterest(loan.principal, loan.interestRate, days, loan.interestType);
}

function getAccruedInterest(loan: Loan, now: Date): number {
  const today = now.toISOString().split("T")[0];
  const endCap = today < loan.endDate ? today : loan.endDate;
  const days = daysBetween(loan.startDate, endCap);
  return calcInterest(loan.remainingBalance, loan.interestRate, days, loan.interestType);
}

// ── Hook ───────────────────────────────────────────────────────────────

export function usePrestamos() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  // ── Create loan ────────────────────────────────────────────────────
  const createLoan = (params: {
    debtor: string;
    principal: number;
    interestRate: number;
    interestType: InterestType;
    sourceAccount: string;
    startDate: string;
    endDate: string;
  }) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();

    const newLoan: Loan = {
      id,
      debtor: params.debtor,
      principal: params.principal,
      remainingBalance: params.principal,
      interestRate: params.interestRate,
      interestType: params.interestType,
      sourceAccount: params.sourceAccount,
      startDate: params.startDate,
      endDate: params.endDate,
      createdAt: now,
    };

    // Asiento doble: desembolso del préstamo
    const entry: LedgerEntry = {
      id: `${id}-disburse`,
      loanId: id,
      date: params.startDate,
      type: "loan_disbursement",
      debitAccount: `Deudor: ${params.debtor}`,      // Aumento en Activo
      debitAmount: params.principal,
      creditAccount: params.sourceAccount,            // Disminución en Cuenta Origen
      creditAmount: params.principal,
      description: `Préstamo otorgado a ${params.debtor} — ${params.sourceAccount}`,
    };

    setLoans((prev) => [...prev, newLoan]);
    setLedger((prev) => [...prev, entry]);
  };

  // ── Register payment ──────────────────────────────────────────────
  const registerPayment = (loanId: string, totalAmount: number, date: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    // Calculate accrued interest up to payment date
    const days = daysBetween(loan.startDate, date);
    const accruedInterest = calcInterest(loan.remainingBalance, loan.interestRate, days, loan.interestType);

    // Separate interest from principal
    const interestPortion = Math.min(totalAmount, accruedInterest);
    const principalPortion = Math.max(0, totalAmount - interestPortion);

    const paymentId = `${loanId}-pay-${Date.now()}`;

    const payment: LoanPayment = {
      id: paymentId,
      loanId,
      date,
      totalAmount,
      principalPortion,
      interestPortion,
    };

    // Ledger entry for principal repayment
    const entries: LedgerEntry[] = [];

    if (principalPortion > 0) {
      entries.push({
        id: `${paymentId}-cap`,
        loanId,
        date,
        type: "payment_received",
        debitAccount: loan.sourceAccount,                  // Efectivo / Banco sube
        debitAmount: principalPortion,
        creditAccount: `Deudor: ${loan.debtor}`,           // Deuda baja
        creditAmount: principalPortion,
        description: `Pago de capital de ${loan.debtor}`,
      });
    }

    if (interestPortion > 0) {
      entries.push({
        id: `${paymentId}-int`,
        loanId,
        date,
        type: "payment_received",
        debitAccount: loan.sourceAccount,                  // Efectivo / Banco sube
        debitAmount: interestPortion,
        creditAccount: "Ingreso por Intereses",            // Nuevo ingreso
        creditAmount: interestPortion,
        description: `Interés cobrado a ${loan.debtor}`,
      });
    }

    setPayments((prev) => [...prev, payment]);
    setLedger((prev) => [...prev, ...entries]);

    // Update remaining balance
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, remainingBalance: Math.max(0, l.remainingBalance - principalPortion) }
          : l
      )
    );
  };

  // ── Derived data ──────────────────────────────────────────────────
  const derived = useMemo(() => {
    const now = new Date();

    const enrichedLoans = loans.map((loan) => {
      const status = getLoanStatus(loan, now);
      const projectedInterest = getProjectedInterest(loan);
      const accruedInterest = getAccruedInterest(loan, now);
      const totalDays = daysBetween(loan.startDate, loan.endDate);
      const elapsedDays = daysBetween(loan.startDate, now.toISOString().split("T")[0]);
      const progress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 100;
      const loanPayments = payments.filter((p) => p.loanId === loan.id);
      const totalPaid = loanPayments.reduce((s, p) => s + p.totalAmount, 0);
      const totalInterestReceived = loanPayments.reduce((s, p) => s + p.interestPortion, 0);
      const totalPrincipalReceived = loanPayments.reduce((s, p) => s + p.principalPortion, 0);

      return {
        ...loan,
        status,
        projectedInterest,
        accruedInterest,
        progress,
        totalDays,
        elapsedDays,
        payments: loanPayments,
        totalPaid,
        totalInterestReceived,
        totalPrincipalReceived,
      };
    });

    const totalLent = loans.reduce((s, l) => s + l.principal, 0);
    const totalOutstanding = loans.reduce((s, l) => s + l.remainingBalance, 0);
    const totalProjectedInterest = enrichedLoans.reduce((s, l) => s + l.projectedInterest, 0);
    const totalInterestReceived = payments.reduce((s, p) => s + p.interestPortion, 0);
    const activeLoans = enrichedLoans.filter((l) => l.status === "vigente").length;
    const overdueLoans = enrichedLoans.filter((l) => l.status === "vencido").length;

    return {
      enrichedLoans,
      totalLent,
      totalOutstanding,
      totalProjectedInterest,
      totalInterestReceived,
      activeLoans,
      overdueLoans,
    };
  }, [loans, payments]);

  return {
    loans,
    payments,
    ledger,
    createLoan,
    registerPayment,
    ...derived,
  };
}
