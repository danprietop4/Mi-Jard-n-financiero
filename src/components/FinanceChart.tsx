import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface ChartDataPoint {
  month: string;
  actual: number | null;
  projected: number;
  income: number;
  expenses: number;
}

interface FinanceChartProps {
  chartData: ChartDataPoint[];
}

type ViewMode = "patrimonio" | "flujo";

const formatK = (value: number) => `$${(value / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="shadow-precision rounded-sm border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-mono-nums text-xs font-medium text-foreground">
            ${entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const FinanceChart = ({ chartData = [] }: FinanceChartProps) => {
  const [view, setView] = useState<ViewMode>("patrimonio");

  const flowData = (chartData ?? []).filter((d) => d.income > 0);

  return (
    <div className="shadow-precision rounded-lg bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Evolución financiera</h2>
        <div className="relative flex rounded-sm bg-muted p-0.5">
          {(["patrimonio", "flujo"] as ViewMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className="relative z-10 px-3 py-1 text-xs font-medium capitalize text-muted-foreground transition-colors"
            >
              {tab === "patrimonio" ? "Patrimonio" : "Flujo de caja"}
              {view === tab && (
                <motion.div
                  layoutId="chart-tab"
                  className="absolute inset-0 rounded-sm bg-card shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            {view === "patrimonio" ? (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5.9%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} tickFormatter={formatK} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#gradActual)" connectNulls={false} />
                <Area type="monotone" dataKey="projected" name="Proyectado" stroke="hsl(220, 14%, 70%)" strokeWidth={2} strokeDasharray="6 3" fill="none" />
              </AreaChart>
            ) : (
              <AreaChart data={flowData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5.9%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} tickFormatter={formatK} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Ingresos" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#gradIncome)" />
                <Area type="monotone" dataKey="expenses" name="Gastos" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#gradExpense)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinanceChart;
