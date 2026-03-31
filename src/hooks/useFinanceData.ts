import { useState, useMemo } from "react";

export interface CategoryRow {
  category: string;
  type: "income" | "expense";
  values: number[];
}

export const PLAN_MONTHS = ["Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar"];

// Historical data (Oct-Mar actual) used as base for patrimony calculation
const HISTORICAL_BASE_PATRIMONY = 0; // Starting Jan patrimony
const HISTORICAL_BALANCES = [0, 0, 0, 0, 0, 0]; // Oct-Mar net balances

const initialData: CategoryRow[] = [
  { category: "Salario", type: "income", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Freelance", type: "income", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Inversiones", type: "income", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Inversiones", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Renta", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Comida", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Transporte", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Servicios", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Entretenimiento", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Ahorro", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Salud", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { category: "Educación", type: "expense", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

export function useFinanceData() {
  const [data, setData] = useState<CategoryRow[]>(initialData);

  const updateCell = (rowIdx: number, colIdx: number, value: number) => {
    setData((prev) => {
      const next = [...prev];
      const row = { ...next[rowIdx] };
      row.values = [...row.values];
      row.values[colIdx] = value;
      next[rowIdx] = row;
      return next;
    });
  };

  const derived = useMemo(() => {
    const incomeRows = data.filter((r) => r.type === "income");
    const expenseRows = data.filter((r) => r.type === "expense");

    const monthlyIncome = PLAN_MONTHS.map((_, i) =>
      incomeRows.reduce((s, r) => s + (r.values[i] ?? 0), 0)
    );
    const monthlyExpense = PLAN_MONTHS.map((_, i) =>
      expenseRows.reduce((s, r) => s + (r.values[i] ?? 0), 0)
    );
    const monthlyBalance = monthlyIncome.map((inc, i) => inc - monthlyExpense[i]);

    // Current patrimony = historical base + historical balances + first planned month balance
    const historicalPatrimony = HISTORICAL_BASE_PATRIMONY + HISTORICAL_BALANCES.reduce((a, b) => a + b, 0);
    // After first planned month (Abr)
    const currentNetWorth = historicalPatrimony + monthlyBalance[0];
    const previousNetWorth = historicalPatrimony;
    const monthDelta = monthlyBalance[0];
    const monthDeltaPercent = previousNetWorth > 0 ? (monthDelta / previousNetWorth) * 100 : 0;

    // Current month stats (first month = Abr)
    const currentIncome = monthlyIncome[0];
    const currentExpense = monthlyExpense[0];
    const currentSavings = currentIncome - currentExpense;
    const savingsRate = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : 0;

    // Previous month stats (Mar historical) for comparison
    const prevIncome = 0; // historical Jun
    const prevExpense = 0; // historical Jun
    const prevSavings = prevIncome - prevExpense;
    const prevSavingsRate = prevIncome > 0 ? (prevSavings / prevIncome) * 100 : 0;

    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;
    const savingsChange = prevSavings !== 0 ? ((currentSavings - prevSavings) / Math.abs(prevSavings)) * 100 : 0;
    const savingsRateChange = savingsRate - prevSavingsRate;

    // Chart data: historical (Oct-Mar actual) + projected (Abr-Mar from planning)
    const historicalMonths = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar"];
    const historicalIncome = [0, 0, 0, 0, 0, 0];
    const historicalExpenses = [0, 0, 0, 0, 0, 0];

    let runningPatrimony = HISTORICAL_BASE_PATRIMONY;
    const chartData = historicalMonths.map((month, i) => {
      runningPatrimony += HISTORICAL_BALANCES[i];
      return {
        month,
        actual: runningPatrimony,
        projected: runningPatrimony,
        income: historicalIncome[i],
        expenses: historicalExpenses[i],
      };
    });

    // Projected months from planning grid
    let projectedPatrimony = runningPatrimony;
    PLAN_MONTHS.forEach((month, i) => {
      projectedPatrimony += monthlyBalance[i];
      chartData.push({
        month,
        actual: null as any,
        projected: projectedPatrimony,
        income: monthlyIncome[i],
        expenses: monthlyExpense[i],
      });
    });

    return {
      netWorth: currentNetWorth,
      monthDelta,
      monthDeltaPercent,
      currentIncome,
      currentExpense,
      currentSavings,
      savingsRate,
      incomeChange,
      expenseChange,
      savingsChange,
      savingsRateChange,
      chartData,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance,
    };
  }, [data]);

  return { data, updateCell, ...derived };
}
