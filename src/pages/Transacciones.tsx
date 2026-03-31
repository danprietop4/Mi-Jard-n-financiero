import { useState } from "react";
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppSidebar from "@/components/AppSidebar";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
}

const initialTransactions: Transaction[] = [];

const categories = ["Todas", "Salario", "Freelance", "Inversiones", "Renta", "Comida", "Transporte", "Servicios", "Entretenimiento", "Ahorro", "Salud", "Educación"];

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const getCategoryStyle = (cat: string) => {
  switch (cat) {
    case "Inversiones": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Salario":
    case "Freelance": return "bg-positive-muted text-positive dark:text-positive";
    case "Ahorro": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "Renta": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    default: return "bg-muted text-muted-foreground";
  }
};

const Transacciones = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", amount: "", category: "Comida", type: "expense" as "income" | "expense", date: new Date().toISOString().split("T")[0] });

  const filtered = transactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterCategory !== "Todas" && tx.category !== filterCategory) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const addTransaction = () => {
    if (!newTx.description || !newTx.amount) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      date: newTx.date,
      description: newTx.description,
      category: newTx.category,
      type: newTx.type,
      amount: parseFloat(newTx.amount),
    };
    setTransactions((prev) => [tx, ...prev]);
    setNewTx({ description: "", amount: "", category: "Comida", type: "expense", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transacciones</h1>
              <p className="text-sm text-muted-foreground">Registro de todos tus movimientos financieros</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5 rounded-sm bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4" /> Nueva transacción
            </Button>
          </div>

          {showForm && (
            <div className="shadow-precision rounded-lg bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Agregar transacción</h3>
              <div className="grid grid-cols-6 gap-3">
                <Input className="col-span-2 rounded-sm" placeholder="Descripción" value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} />
                <Input className="rounded-sm" type="number" placeholder="Monto" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} />
                <Input className="rounded-sm" type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} />
                <Select value={newTx.type} onValueChange={(v) => setNewTx({ ...newTx, type: v as "income" | "expense" })}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addTransaction} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">Agregar</Button>
              </div>
              <div className="mt-2">
                <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v })}>
                  <SelectTrigger className="w-[200px] rounded-sm"><SelectValue placeholder="Categoría" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "Todas").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="rounded-sm pl-9" placeholder="Buscar transacciones..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-[140px] rounded-sm"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px] rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Summary bar */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 rounded-sm bg-positive-muted px-3 py-1.5">
              <ArrowDownLeft className="h-3.5 w-3.5 text-positive" />
              <span className="font-mono-nums text-sm font-medium text-positive">{fmt(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-negative-muted px-3 py-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-negative" />
              <span className="font-mono-nums text-sm font-medium text-negative">{fmt(totalExpense)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-muted px-3 py-1.5">
              <span className="text-xs text-muted-foreground">{filtered.length} transacciones</span>
            </div>
          </div>

          {/* Table */}
          <div className="shadow-precision overflow-hidden rounded-lg bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descripción</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoría</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono-nums text-sm text-muted-foreground">{tx.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryStyle(tx.category)}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${tx.type === "income" ? "text-positive" : "text-negative"}`}>
                      {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transacciones;
