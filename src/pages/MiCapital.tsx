import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ExchangeRateModal from "@/components/ExchangeRateModal";
import { useTransactions } from "@/hooks/useTransactions";
import { useCapital } from "@/hooks/useCapital";
import { fmtUSD, fmtBs, fmtRate, fmtDate } from "@/lib/formatters";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  RefreshCw,
  Plus,
  Trash2,
  ArrowDownRight,
  Activity,
  Banknote,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const categories = [
  "Renta",
  "Comida",
  "Transporte",
  "Servicios",
  "Entretenimiento",
  "Ahorro",
  "Salud",
  "Educación",
  "Inversiones",
  "Otro",
];

const MiCapital = () => {
  const { transactions, addTransaction, removeTransaction } =
    useTransactions();
  const capital = useCapital(transactions);

  const [showRateModal, setShowRateModal] = useState(!capital.hasUpdatedToday);
  const [editingSalary, setEditingSalary] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Comida",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddExpense = () => {
    const amount = parseFloat(newExpense.amount.replace(/[^0-9.]/g, ""));
    if (!newExpense.description || isNaN(amount) || amount <= 0) return;
    addTransaction({
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category,
      type: newExpense.type,
      amount,
    });
    setNewExpense({
      description: "",
      amount: "",
      category: "Comida",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
    setShowExpenseForm(false);
  };

  const RateTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="shadow-precision rounded-sm border border-border bg-card px-3 py-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {payload
          .filter((p: any) => p.value != null)
          .map((p: any) => (
            <p
              key={p.dataKey}
              className="font-mono-nums text-sm font-medium text-foreground"
            >
              {p.value?.toFixed(2)} Bs/$
            </p>
          ))}
      </div>
    );
  };

  const hasProjectionData =
    capital.exchangeRateHistory.length >= 2 && capital.todayRate > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          {/* Exchange Rate Modal */}
          <ExchangeRateModal
            open={showRateModal}
            onSave={(rate) => {
              capital.addExchangeRate(rate);
              setShowRateModal(false);
            }}
            onSkip={() => setShowRateModal(false)}
            lastRate={capital.exchangeRateHistory[0]?.rate ?? 0}
          />

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Mi Capital
              </h1>
              <p className="text-sm text-muted-foreground">
                Centro de control de tu capital mensual
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-sm"
              onClick={() => setShowRateModal(true)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar tasa
            </Button>
          </div>

          {/* ===== HERO PANEL ===== */}
          <div className="relative overflow-hidden rounded-xl bg-card shadow-precision">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-cyan-500/5" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative p-6">
              {/* Top: Salary + Rate badge */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="label-caps mb-2">Sueldo Mensual</p>
                  <div className="flex items-baseline gap-3">
                    {editingSalary ? (
                      <input
                        type="text"
                        defaultValue={capital.salaryUSD || ""}
                        placeholder="0.00"
                        className="w-48 rounded-sm bg-transparent px-2 font-mono-nums text-4xl font-bold tracking-tight text-foreground outline-none ring-2 ring-primary"
                        onBlur={(e) => {
                          const n = parseFloat(
                            e.target.value.replace(/[^0-9.]/g, "")
                          );
                          if (!isNaN(n) && n > 0) capital.setSalaryUSD(n);
                          setEditingSalary(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const n = parseFloat(
                              (e.target as HTMLInputElement).value.replace(
                                /[^0-9.]/g,
                                ""
                              )
                            );
                            if (!isNaN(n) && n > 0) capital.setSalaryUSD(n);
                            setEditingSalary(false);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <p
                        className="cursor-pointer font-mono-nums text-4xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
                        onClick={() => setEditingSalary(true)}
                        title="Click para editar"
                      >
                        {fmtUSD(capital.salaryUSD)}
                      </p>
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      USD / mes
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {capital.todayRate > 0 ? (
                    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      <span className="font-mono-nums text-sm font-semibold text-primary">
                        {fmtRate(capital.todayRate)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-negative/10 px-3 py-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-negative" />
                      <span className="text-xs font-medium text-negative">
                        Sin tasa del día
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {fmtDate(new Date().toISOString().split("T")[0])}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-border/60" />

              {/* Bottom: Conversion + Capital */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Equivalente en bolívares
                  </p>
                  <p className="font-mono-nums text-2xl font-semibold text-foreground">
                    {fmtBs(capital.salaryBs)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Capital disponible
                  </p>
                  <p className="font-mono-nums text-2xl font-semibold text-primary">
                    {fmtBs(capital.capitalDisponibleBs)}
                  </p>
                  <p className="font-mono-nums text-sm text-muted-foreground">
                    ≈ {fmtUSD(capital.capitalDisponibleUSD)}
                  </p>
                </div>
              </div>

              {/* Spent progress bar */}
              {capital.salaryBs > 0 && (
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Gastado este mes
                    </span>
                    <span className="font-mono-nums text-xs font-medium text-muted-foreground">
                      {capital.spentPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        capital.spentPercent > 90
                          ? "bg-negative"
                          : capital.spentPercent > 70
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${capital.spentPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== STATS CARDS ===== */}
          <div className="grid grid-cols-4 gap-3">
            <div className="shadow-precision flex items-start gap-3 rounded-lg bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Sueldo USD</p>
                <p className="font-mono-nums text-lg font-semibold tracking-tight text-foreground">
                  {fmtUSD(capital.salaryUSD)}
                </p>
              </div>
            </div>
            <div className="shadow-precision flex items-start gap-3 rounded-lg bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-blue-500/10">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tasa del día</p>
                <p className="font-mono-nums text-lg font-semibold tracking-tight text-foreground">
                  {capital.todayRate > 0
                    ? fmtRate(capital.todayRate)
                    : "—"}
                </p>
              </div>
            </div>
            <div className="shadow-precision flex items-start gap-3 rounded-lg bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber-500/10">
                <Banknote className="h-4 w-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Capital Bs</p>
                <p className="font-mono-nums text-lg font-semibold tracking-tight text-foreground">
                  {fmtBs(capital.capitalDisponibleBs)}
                </p>
              </div>
            </div>
            <div className="shadow-precision flex items-start gap-3 rounded-lg bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-purple-500/10">
                <Wallet className="h-4 w-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Capital USD</p>
                <p className="font-mono-nums text-lg font-semibold tracking-tight text-foreground">
                  {fmtUSD(capital.capitalDisponibleUSD)}
                </p>
              </div>
            </div>
          </div>

          {/* ===== DEVALUATION PROJECTION ===== */}
          <div className="shadow-precision rounded-lg bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingDown className="h-4 w-4 text-negative" />
                Proyección de Devaluación — Fin de Mes
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {capital.daysLeft} días restantes en el mes ·{" "}
                {capital.exchangeRateHistory.length} registros de tasa
              </p>
            </div>
            <div className="grid grid-cols-5 gap-0 divide-x divide-border">
              {/* Metrics */}
              <div className="col-span-2 space-y-4 p-6">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tasa proyectada
                  </p>
                  <p className="font-mono-nums text-xl font-semibold text-foreground">
                    {hasProjectionData
                      ? fmtRate(capital.projectedEndOfMonthRate)
                      : "—"}
                  </p>
                  {hasProjectionData && capital.avgDailyIncrease !== 0 && (
                    <span
                      className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
                        capital.avgDailyIncrease > 0
                          ? "text-negative"
                          : "text-positive"
                      }`}
                    >
                      {capital.avgDailyIncrease > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {capital.avgDailyIncrease > 0 ? "+" : ""}
                      {capital.avgDailyIncrease.toFixed(2)} Bs/día
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Capital real al fin de mes
                  </p>
                  <p className="font-mono-nums text-xl font-semibold text-foreground">
                    {hasProjectionData
                      ? fmtUSD(capital.projectedCapitalUSD)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Pérdida estimada
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono-nums text-xl font-semibold text-negative">
                      {hasProjectionData
                        ? `-${fmtUSD(Math.abs(capital.estimatedLossUSD))}`
                        : "—"}
                    </p>
                    {hasProjectionData && capital.estimatedLossPercent !== 0 && (
                      <span className="rounded-sm bg-negative/10 px-1.5 py-0.5 font-mono-nums text-xs font-semibold text-negative">
                        -{Math.abs(capital.estimatedLossPercent).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                {!hasProjectionData && (
                  <p className="text-xs italic text-muted-foreground">
                    Registra al menos 2 tasas para ver la proyección.
                  </p>
                )}
              </div>
              {/* Mini chart */}
              <div className="col-span-3 p-6">
                {capital.rateChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={capital.rateChartData}>
                      <defs>
                        <linearGradient
                          id="rateGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(142, 71%, 45%)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(142, 71%, 45%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="projGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(0, 84%, 60%)"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(0, 84%, 60%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "hsl(240, 3.8%, 46.1%)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 10, fill: "hsl(240, 3.8%, 46.1%)" }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                      />
                      <Tooltip content={<RateTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(142, 71%, 45%)"
                        strokeWidth={2}
                        fill="url(#rateGrad)"
                        connectNulls={false}
                        dot={{ r: 3, fill: "hsl(142, 71%, 45%)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        fill="url(#projGrad)"
                        connectNulls={false}
                        dot={{ r: 3, fill: "hsl(0, 84%, 60%)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Registra tasas diarias para ver el gráfico de tendencia
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== EXPENSES ===== */}
          <div className="shadow-precision overflow-hidden rounded-lg bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Gastos del Mes
              </h2>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-sm text-xs"
                onClick={() => setShowExpenseForm(!showExpenseForm)}
              >
                <Plus className="h-3.5 w-3.5" />
                {newExpense.type === "expense" ? "Agregar gasto" : "Agregar ingreso"}
              </Button>
            </div>

            {showExpenseForm && (
              <div className="border-b border-border bg-muted/30 p-4">
                <div className="grid grid-cols-6 gap-3">
                  <Input
                    className="col-span-2 rounded-sm"
                    placeholder="Descripción"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, description: e.target.value })
                    }
                  />
                  <Input
                    className="rounded-sm font-mono-nums"
                    type="text"
                    inputMode="decimal"
                    placeholder="Monto Bs"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                  />
                  <Input
                    className="rounded-sm"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                  />
                  <Select
                    value={newExpense.type}
                    onValueChange={(v) =>
                      setNewExpense({
                        ...newExpense,
                        type: v as "income" | "expense",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="income">Ingreso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddExpense}
                    className="rounded-sm bg-foreground text-background hover:bg-foreground/90"
                  >
                    Agregar
                  </Button>
                </div>
                <div className="mt-2">
                  <Select
                    value={newExpense.category}
                    onValueChange={(v) =>
                      setNewExpense({ ...newExpense, category: v })
                    }
                  >
                    <SelectTrigger className="w-[200px] rounded-sm">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Descripción
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categoría
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Monto (Bs)
                  </th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {capital.monthTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No hay transacciones este mes
                    </td>
                  </tr>
                ) : (
                  capital.monthTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-mono-nums text-sm text-muted-foreground">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${
                          tx.type === "income"
                            ? "text-positive"
                            : "text-negative"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {fmtBs(tx.amount)}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => removeTransaction(tx.id)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-negative/10 hover:text-negative"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== EXCHANGE RATE HISTORY ===== */}
          <div className="shadow-precision overflow-hidden rounded-lg bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                Historial de Tasa Cambiaria
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tasa (Bs/$)
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Variación
                  </th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {capital.exchangeRateHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No hay registros de tasa cambiaria
                    </td>
                  </tr>
                ) : (
                  capital.exchangeRateHistory.map((entry, idx) => {
                    const prev =
                      idx < capital.exchangeRateHistory.length - 1
                        ? capital.exchangeRateHistory[idx + 1]
                        : null;
                    const change = prev
                      ? ((entry.rate - prev.rate) / prev.rate) * 100
                      : 0;
                    const isUp = change > 0;

                    return (
                      <tr
                        key={entry.date}
                        className="border-b border-border/50 transition-colors hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 text-sm text-foreground">
                          {fmtDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-nums text-sm font-medium text-foreground">
                          {entry.rate.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {prev ? (
                            <span
                              className={`inline-flex items-center gap-1 font-mono-nums text-xs font-medium ${
                                isUp ? "text-negative" : "text-positive"
                              }`}
                            >
                              {isUp ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {isUp ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            onClick={() =>
                              capital.deleteExchangeRate(entry.date)
                            }
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-negative/10 hover:text-negative"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MiCapital;
