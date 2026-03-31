import { BarChart3, Wallet, CreditCard, PiggyBank } from "lucide-react";

interface QuickStatsProps {
  currentIncome: number;
  currentExpense: number;
  currentSavings: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  savingsRateChange: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const QuickStats = ({
  currentIncome = 0, currentExpense = 0, currentSavings = 0, savingsRate = 0,
  incomeChange = 0, expenseChange = 0, savingsChange = 0, savingsRateChange = 0,
}: QuickStatsProps) => {
  const stats = [
    { label: "Ingresos del mes", value: fmt(currentIncome), change: `${incomeChange >= 0 ? "+" : ""}${(incomeChange ?? 0).toFixed(1)}%`, positive: incomeChange >= 0, icon: Wallet },
    { label: "Gastos del mes", value: fmt(currentExpense), change: `${expenseChange >= 0 ? "+" : ""}${(expenseChange ?? 0).toFixed(1)}%`, positive: expenseChange <= 0, icon: CreditCard },
    { label: "Ahorro mensual", value: fmt(currentSavings), change: `${savingsChange >= 0 ? "+" : ""}${(savingsChange ?? 0).toFixed(1)}%`, positive: savingsChange >= 0, icon: PiggyBank },
    { label: "Tasa de ahorro", value: `${(savingsRate ?? 0).toFixed(1)}%`, change: `${savingsRateChange >= 0 ? "+" : ""}${(savingsRateChange ?? 0).toFixed(1)}pp`, positive: savingsRateChange >= 0, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="shadow-precision flex items-start gap-3 rounded-lg bg-card p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-muted">
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-mono-nums text-lg font-semibold tracking-tight text-foreground">{stat.value}</p>
            <span className={`text-xs font-medium ${stat.positive ? "text-positive" : "text-negative"}`}>
              {stat.change} vs. mes anterior
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
