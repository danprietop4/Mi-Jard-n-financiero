import { useState, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
}

const initialBudget: BudgetCategory[] = [
  { id: "1", name: "Inversiones", budgeted: 0, spent: 0 },
  { id: "2", name: "Renta", budgeted: 0, spent: 0 },
  { id: "3", name: "Comida", budgeted: 0, spent: 0 },
  { id: "4", name: "Transporte", budgeted: 0, spent: 0 },
  { id: "5", name: "Servicios", budgeted: 0, spent: 0 },
  { id: "6", name: "Entretenimiento", budgeted: 0, spent: 0 },
  { id: "7", name: "Ahorro", budgeted: 0, spent: 0 },
  { id: "8", name: "Salud", budgeted: 0, spent: 0 },
  { id: "9", name: "Educación", budgeted: 0, spent: 0 },
];

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const Presupuesto = () => {
  const [budget, setBudget] = useState(initialBudget);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalBudgeted = useMemo(() => budget.reduce((s, b) => s + b.budgeted, 0), [budget]);
  const totalSpent = useMemo(() => budget.reduce((s, b) => s + b.spent, 0), [budget]);
  const remaining = totalBudgeted - totalSpent;

  const chartData = budget.map((b) => ({
    name: b.name,
    presupuestado: b.budgeted,
    gastado: b.spent,
    pct: b.budgeted > 0 ? (b.spent / b.budgeted) * 100 : 0,
  }));

  const handleBudgetChange = (id: string, value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return;
    setBudget((prev) => prev.map((b) => (b.id === id ? { ...b, budgeted: num } : b)));
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="shadow-precision rounded-sm border border-border bg-card p-3">
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-mono-nums text-xs font-medium">{fmt(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Presupuesto</h1>
            <p className="text-sm text-muted-foreground">Gestiona tu presupuesto mensual por categoría</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="shadow-precision rounded-lg bg-card p-4">
              <p className="text-xs text-muted-foreground">Total presupuestado</p>
              <p className="font-mono-nums text-xl font-semibold text-foreground">{fmt(totalBudgeted)}</p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <p className="text-xs text-muted-foreground">Total gastado</p>
              <p className="font-mono-nums text-xl font-semibold text-negative">{fmt(totalSpent)}</p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <p className="text-xs text-muted-foreground">Restante</p>
              <p className={`font-mono-nums text-xl font-semibold ${remaining >= 0 ? "text-positive" : "text-negative"}`}>{fmt(remaining)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="shadow-precision rounded-lg bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Presupuesto vs. Gasto por categoría</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5.9%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(240, 3.8%, 46.1%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="presupuestado" name="Presupuestado" fill="hsl(240, 5.9%, 90%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="gastado" name="Gastado" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.pct > 90 ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget table */}
          <div className="shadow-precision overflow-hidden rounded-lg bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Desglose por categoría</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoría</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Presupuestado</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Gastado</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Restante</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Progreso</th>
                </tr>
              </thead>
              <tbody>
                {budget.map((b) => {
                  const pct = b.budgeted > 0 ? (b.spent / b.budgeted) * 100 : 0;
                  const rem = b.budgeted - b.spent;
                  const isOver = pct > 100;
                  return (
                    <tr key={b.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{b.name}</td>
                      <td className="px-4 py-3 text-right" onClick={() => setEditingId(b.id)}>
                        {editingId === b.id ? (
                          <input
                            type="text"
                            defaultValue={b.budgeted}
                            className="w-24 rounded-sm bg-muted px-2 py-1 text-right font-mono-nums text-sm text-foreground outline-none ring-1 ring-foreground"
                            onBlur={(e) => { handleBudgetChange(b.id, e.target.value); setEditingId(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { handleBudgetChange(b.id, (e.target as HTMLInputElement).value); setEditingId(null); } }}
                            autoFocus
                          />
                        ) : (
                          <span className="cursor-pointer font-mono-nums text-sm text-foreground">{fmt(b.budgeted)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-nums text-sm text-foreground">{fmt(b.spent)}</td>
                      <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${rem >= 0 ? "text-positive" : "text-negative"}`}>
                        {rem >= 0 ? fmt(rem) : `-${fmt(Math.abs(rem))}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${isOver ? "bg-negative" : pct > 80 ? "bg-yellow-500" : "bg-positive"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono-nums text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Presupuesto;
