import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Plus, Handshake, Clock, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { usePrestamos, type InterestType, type LoanStatus } from "@/hooks/usePrestamos";

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

const statusConfig: Record<LoanStatus, { label: string; color: string; icon: typeof Clock }> = {
  vigente: { label: "Vigente", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  vencido: { label: "Vencido", color: "bg-negative-muted text-negative", icon: AlertTriangle },
  pagado: { label: "Pagado", color: "bg-positive-muted text-positive", icon: CheckCircle2 },
};

const sourceAccounts = ["Mi Banco", "Efectivo", "Cuenta de Ahorro", "Otro"];

const Prestamos = () => {
  const {
    enrichedLoans,
    ledger,
    totalLent,
    totalOutstanding,
    totalProjectedInterest,
    totalInterestReceived,
    activeLoans,
    overdueLoans,
    createLoan,
    registerPayment,
  } = usePrestamos();

  const [showForm, setShowForm] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);

  const [newLoan, setNewLoan] = useState({
    debtor: "",
    principal: "",
    interestRate: "",
    interestType: "simple" as InterestType,
    sourceAccount: "Mi Banco",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const handleCreate = () => {
    if (!newLoan.debtor || !newLoan.principal || !newLoan.endDate) return;
    createLoan({
      debtor: newLoan.debtor,
      principal: parseFloat(newLoan.principal),
      interestRate: parseFloat(newLoan.interestRate || "0") / 100, // Convert % to decimal
      interestType: newLoan.interestType,
      sourceAccount: newLoan.sourceAccount,
      startDate: newLoan.startDate,
      endDate: newLoan.endDate,
    });
    setNewLoan({
      debtor: "",
      principal: "",
      interestRate: "",
      interestType: "simple",
      sourceAccount: "Mi Banco",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setShowForm(false);
  };

  const handlePayment = (loanId: string) => {
    if (!payAmount) return;
    registerPayment(loanId, parseFloat(payAmount), payDate);
    setPayAmount("");
    setPayDate(new Date().toISOString().split("T")[0]);
    setPayingLoanId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Préstamos</h1>
              <p className="text-sm text-muted-foreground">Registra y da seguimiento al dinero que has prestado</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowLedger(!showLedger)}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-sm"
              >
                <BookOpen className="h-4 w-4" /> Libro contable
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                size="sm"
                className="gap-1.5 rounded-sm bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="h-4 w-4" /> Nuevo préstamo
              </Button>
            </div>
          </div>

          {/* New Loan Form */}
          {showForm && (
            <div className="shadow-precision rounded-lg bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Registrar préstamo</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Nombre del deudor</label>
                  <Input
                    className="rounded-sm"
                    placeholder="Ej. Juan Pérez"
                    value={newLoan.debtor}
                    onChange={(e) => setNewLoan({ ...newLoan, debtor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Monto prestado (P)</label>
                  <Input
                    className="rounded-sm"
                    type="number"
                    placeholder="0.00"
                    value={newLoan.principal}
                    onChange={(e) => setNewLoan({ ...newLoan, principal: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Tasa de interés (% anual)</label>
                  <Input
                    className="rounded-sm"
                    type="number"
                    placeholder="5"
                    value={newLoan.interestRate}
                    onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Tipo de interés</label>
                  <Select value={newLoan.interestType} onValueChange={(v) => setNewLoan({ ...newLoan, interestType: v as InterestType })}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple (I = P × r × t)</SelectItem>
                      <SelectItem value="compound">Compuesto (I = P(1+r)ᵗ − P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Cuenta de origen</label>
                  <Select value={newLoan.sourceAccount} onValueChange={(v) => setNewLoan({ ...newLoan, sourceAccount: v })}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceAccounts.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Fecha de inicio</label>
                  <Input
                    className="rounded-sm"
                    type="date"
                    value={newLoan.startDate}
                    onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Fecha de vencimiento (T)</label>
                  <Input
                    className="rounded-sm"
                    type="date"
                    value={newLoan.endDate}
                    onChange={(e) => setNewLoan({ ...newLoan, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview */}
              {newLoan.principal && newLoan.interestRate && newLoan.startDate && newLoan.endDate && (
                <div className="mt-4 rounded-sm bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">Vista previa del interés proyectado</p>
                  <p className="font-mono-nums text-sm font-semibold text-foreground">
                    {(() => {
                      const p = parseFloat(newLoan.principal) || 0;
                      const r = (parseFloat(newLoan.interestRate) || 0) / 100;
                      const d1 = new Date(newLoan.startDate);
                      const d2 = new Date(newLoan.endDate);
                      const days = Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / 86400000));
                      const t = days / 365;
                      const interest = newLoan.interestType === "simple" ? p * r * t : p * Math.pow(1 + r, t) - p;
                      return `${fmt(interest)} en ${days} días (${(t * 12).toFixed(1)} meses)`;
                    })()}
                  </p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button size="sm" className="rounded-sm bg-foreground text-background hover:bg-foreground/90" onClick={handleCreate}>
                  Registrar préstamo
                </Button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total prestado</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-foreground">{fmt(totalLent)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeLoans} vigente{activeLoans !== 1 ? "s" : ""} · {overdueLoans} vencido{overdueLoans !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Saldo pendiente</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-negative">{fmt(totalOutstanding)}</p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Interés proyectado</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-positive">{fmt(totalProjectedInterest)}</p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Interés recibido</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-foreground">{fmt(totalInterestReceived)}</p>
            </div>
          </div>

          {/* Loans List */}
          {enrichedLoans.length === 0 && !showForm && (
            <div className="shadow-precision flex flex-col items-center justify-center rounded-lg bg-card py-16">
              <Handshake className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No hay préstamos registrados</p>
              <p className="text-xs text-muted-foreground">Haz clic en "Nuevo préstamo" para comenzar</p>
            </div>
          )}

          <div className="space-y-3">
            {enrichedLoans.map((loan) => {
              const { label, color, icon: StatusIcon } = statusConfig[loan.status];
              const isExpanded = expandedLoan === loan.id;
              const isPaying = payingLoanId === loan.id;

              return (
                <div key={loan.id} className={`shadow-precision rounded-lg bg-card transition-all ${loan.status === "vencido" ? "ring-1 ring-negative/30" : loan.status === "pagado" ? "ring-1 ring-positive/20" : ""}`}>
                  {/* Main row */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-bold text-foreground">
                        {loan.debtor.split(" ").map((w) => w[0]).join("").toUpperCase().substring(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{loan.debtor}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {loan.sourceAccount} · {fmtPct(loan.interestRate)} {loan.interestType === "simple" ? "simple" : "compuesto"} · {loan.startDate} → {loan.endDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-nums text-lg font-semibold text-foreground">{fmt(loan.remainingBalance)}</p>
                      <p className="text-xs text-muted-foreground">de {fmt(loan.principal)}</p>
                    </div>
                    <div className="flex gap-1">
                      {loan.status !== "pagado" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm text-xs"
                          onClick={() => { setPayingLoanId(isPaying ? null : loan.id); setExpandedLoan(null); }}
                        >
                          <DollarSign className="mr-1 h-3 w-3" /> Pago
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-sm px-2"
                        onClick={() => { setExpandedLoan(isExpanded ? null : loan.id); setPayingLoanId(null); }}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3">
                      <Progress value={loan.progress} className="h-1.5 flex-1" />
                      <span className="font-mono-nums text-xs text-muted-foreground">{loan.progress.toFixed(0)}% del plazo</span>
                    </div>
                  </div>

                  {/* Payment form */}
                  {isPaying && (
                    <div className="border-t border-border p-4">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registrar pago</h4>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="mb-1 block text-xs text-muted-foreground">Monto total recibido</label>
                          <Input
                            className="rounded-sm"
                            type="number"
                            placeholder="0.00"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="mb-1 block text-xs text-muted-foreground">Fecha del pago</label>
                          <Input
                            className="rounded-sm"
                            type="date"
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="rounded-sm bg-foreground text-background hover:bg-foreground/90"
                          onClick={() => handlePayment(loan.id)}
                        >
                          Aplicar pago
                        </Button>
                      </div>

                      {payAmount && (
                        <div className="mt-3 rounded-sm bg-muted p-3">
                          <p className="text-xs text-muted-foreground">
                            El pago se distribuirá: primero al <span className="font-medium text-foreground">interés devengado</span>,
                            luego al <span className="font-medium text-foreground">capital</span>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Capital original</p>
                          <p className="font-mono-nums text-sm font-semibold text-foreground">{fmt(loan.principal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Capital pendiente</p>
                          <p className="font-mono-nums text-sm font-semibold text-negative">{fmt(loan.remainingBalance)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Capital recuperado</p>
                          <p className="font-mono-nums text-sm font-semibold text-positive">{fmt(loan.totalPrincipalReceived)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Interés proyectado total</p>
                          <p className="font-mono-nums text-sm font-semibold text-foreground">{fmt(loan.projectedInterest)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Interés devengado</p>
                          <p className="font-mono-nums text-sm font-semibold text-foreground">{fmt(loan.accruedInterest)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Interés recibido</p>
                          <p className="font-mono-nums text-sm font-semibold text-positive">{fmt(loan.totalInterestReceived)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Plazo</p>
                          <p className="text-sm font-medium text-foreground">{loan.totalDays} días ({(loan.totalDays / 30).toFixed(1)} meses)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Días transcurridos</p>
                          <p className="text-sm font-medium text-foreground">{loan.elapsedDays} días</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total pagado</p>
                          <p className="font-mono-nums text-sm font-semibold text-foreground">{fmt(loan.totalPaid)}</p>
                        </div>
                      </div>

                      {/* Payment history */}
                      {loan.payments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial de pagos</h4>
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border bg-muted">
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Capital</th>
                                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Interés</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loan.payments.map((p) => (
                                <tr key={p.id} className="border-b border-border/50">
                                  <td className="px-3 py-2 font-mono-nums text-sm text-muted-foreground">{p.date}</td>
                                  <td className="px-3 py-2 text-right font-mono-nums text-sm font-medium text-foreground">{fmt(p.totalAmount)}</td>
                                  <td className="px-3 py-2 text-right font-mono-nums text-sm text-foreground">{fmt(p.principalPortion)}</td>
                                  <td className="px-3 py-2 text-right font-mono-nums text-sm text-positive">{fmt(p.interestPortion)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ledger / Libro Contable */}
          {showLedger && ledger.length > 0 && (
            <div className="shadow-precision overflow-hidden rounded-lg bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Libro contable — Asientos dobles</h2>
                <p className="text-xs text-muted-foreground">Registro de todos los movimientos contables generados</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descripción</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cuenta Debe</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Debe</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cuenta Haber</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono-nums text-sm text-muted-foreground">{entry.date}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{entry.description}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-sm bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {entry.debitAccount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-nums text-sm font-medium text-foreground">{fmt(entry.debitAmount)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-sm bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          {entry.creditAccount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-nums text-sm font-medium text-foreground">{fmt(entry.creditAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Prestamos;
