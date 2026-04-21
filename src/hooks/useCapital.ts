import { useState, useMemo, useCallback } from "react";
import type { Transaction } from "./useTransactions";

export interface ExchangeRateEntry {
  date: string;
  rate: number;
}

interface CapitalState {
  salaryUSD: number;
  exchangeRateHistory: ExchangeRateEntry[];
}

const STORAGE_KEY = "vault-capital";

function load(): CapitalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { salaryUSD: 0, exchangeRateHistory: [] };
  } catch {
    return { salaryUSD: 0, exchangeRateHistory: [] };
  }
}

function persist(s: CapitalState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export function useCapital(transactions: Transaction[]) {
  const [state, setState] = useState<CapitalState>(load);
  const today = getToday();

  // --- actions ---
  const setSalaryUSD = useCallback((v: number) => {
    setState((p) => {
      const n = { ...p, salaryUSD: v };
      persist(n);
      return n;
    });
  }, []);

  const addExchangeRate = useCallback(
    (rate: number) => {
      setState((p) => {
        const filtered = p.exchangeRateHistory.filter((e) => e.date !== today);
        const n = {
          ...p,
          exchangeRateHistory: [{ date: today, rate }, ...filtered].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        };
        persist(n);
        return n;
      });
    },
    [today]
  );

  const deleteExchangeRate = useCallback((date: string) => {
    setState((p) => {
      const n = {
        ...p,
        exchangeRateHistory: p.exchangeRateHistory.filter((e) => e.date !== date),
      };
      persist(n);
      return n;
    });
  }, []);

  // --- derived ---
  const derived = useMemo(() => {
    const { salaryUSD, exchangeRateHistory } = state;

    // Today's rate
    const todayEntry = exchangeRateHistory.find((e) => e.date === today);
    const todayRate = todayEntry?.rate ?? 0;
    const hasUpdatedToday = !!todayEntry;

    // Salary in Bs
    const salaryBs = salaryUSD * todayRate;

    // Current month transactions
    const ym = today.substring(0, 7);
    const monthTxs = transactions.filter((t) => t.date.startsWith(ym));
    const totalExpensesBs = monthTxs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const totalIncomeBs = monthTxs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    // Capital = salary converted + other income - expenses
    const capitalDisponibleBs = salaryBs + totalIncomeBs - totalExpensesBs;
    const capitalDisponibleUSD =
      todayRate > 0 ? capitalDisponibleBs / todayRate : 0;

    // Spent percentage
    const spentPercent =
      salaryBs > 0 ? Math.min((totalExpensesBs / salaryBs) * 100, 100) : 0;

    // --- devaluation projection ---
    const sorted = [...exchangeRateHistory].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let avgDailyIncrease = 0;
    if (sorted.length >= 2) {
      let totalChange = 0;
      let totalDays = 0;
      for (let i = 1; i < sorted.length; i++) {
        const d =
          (new Date(sorted[i].date).getTime() -
            new Date(sorted[i - 1].date).getTime()) /
          86400000;
        if (d > 0) {
          totalChange += sorted[i].rate - sorted[i - 1].rate;
          totalDays += d;
        }
      }
      avgDailyIncrease = totalDays > 0 ? totalChange / totalDays : 0;
    }

    const now = new Date();
    const dim = daysInMonth(now.getFullYear(), now.getMonth());
    const daysLeft = dim - now.getDate();

    const projectedEndOfMonthRate = Math.max(
      todayRate + avgDailyIncrease * daysLeft,
      todayRate
    );
    const projectedCapitalUSD =
      projectedEndOfMonthRate > 0
        ? capitalDisponibleBs / projectedEndOfMonthRate
        : 0;
    const estimatedLossUSD = capitalDisponibleUSD - projectedCapitalUSD;
    const estimatedLossPercent =
      capitalDisponibleUSD > 0
        ? (estimatedLossUSD / capitalDisponibleUSD) * 100
        : 0;

    // Rate chart data
    const rateChartData = sorted.map((e) => ({
      label: e.date.substring(5),
      rate: e.rate,
      projected: null as number | null,
    }));

    if (todayRate > 0 && daysLeft > 0) {
      if (rateChartData.length > 0) {
        rateChartData[rateChartData.length - 1].projected =
          rateChartData[rateChartData.length - 1].rate;
      }
      const endLabel = `${String(now.getMonth() + 1).padStart(2, "0")}-${dim}`;
      rateChartData.push({
        label: endLabel,
        rate: null as any,
        projected: projectedEndOfMonthRate,
      });
    }

    return {
      salaryUSD,
      todayRate,
      hasUpdatedToday,
      salaryBs,
      totalExpensesBs,
      totalIncomeBs,
      capitalDisponibleBs,
      capitalDisponibleUSD,
      spentPercent,
      avgDailyIncrease,
      projectedEndOfMonthRate,
      projectedCapitalUSD,
      estimatedLossUSD,
      estimatedLossPercent,
      exchangeRateHistory,
      monthTransactions: monthTxs,
      daysLeft,
      rateChartData,
    };
  }, [state, transactions, today]);

  return { ...derived, setSalaryUSD, addExchangeRate, deleteExchangeRate };
}
