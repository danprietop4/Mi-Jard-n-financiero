import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Plus, Target, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  monthlyContribution: number;
}

const initialGoals: Goal[] = [];

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const Metas = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "", monthlyContribution: "" });

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        current: 0,
        deadline: newGoal.deadline || "2027-12-31",
        monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
      },
    ]);
    setNewGoal({ name: "", target: "", deadline: "", monthlyContribution: "" });
    setShowForm(false);
  };

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0);
  const completedGoals = goals.filter((g) => g.current >= g.target).length;

  const monthsRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Metas financieras</h1>
              <p className="text-sm text-muted-foreground">Planifica y da seguimiento a tus objetivos de ahorro</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5 rounded-sm bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4" /> Nueva meta
            </Button>
          </div>

          {showForm && (
            <div className="shadow-precision rounded-lg bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Crear meta</h3>
              <div className="grid grid-cols-4 gap-3">
                <Input className="rounded-sm" placeholder="Nombre de la meta" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} />
                <Input className="rounded-sm" type="number" placeholder="Monto objetivo" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} />
                <Input className="rounded-sm" type="date" placeholder="Fecha límite" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
                <Button onClick={addGoal} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">Crear</Button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Progreso total</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-foreground">{fmt(totalCurrent)} <span className="text-sm text-muted-foreground">/ {fmt(totalTarget)}</span></p>
              <Progress value={(totalCurrent / totalTarget) * 100} className="mt-2 h-1.5" />
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Contribución mensual</p>
              </div>
              <p className="font-mono-nums text-xl font-semibold text-foreground">
                {fmt(goals.reduce((s, g) => s + g.monthlyContribution, 0))}
              </p>
            </div>
            <div className="shadow-precision rounded-lg bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Check className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Metas completadas</p>
              </div>
              <p className="text-xl font-semibold text-foreground">{completedGoals} <span className="text-sm text-muted-foreground">/ {goals.length}</span></p>
            </div>
          </div>

          {/* Goals grid */}
          <div className="grid grid-cols-2 gap-4">
            {goals.map((goal) => {
              const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              const completed = pct >= 100;
              const remaining = goal.target - goal.current;
              const months = monthsRemaining(goal.deadline);

              return (
                <div key={goal.id} className={`shadow-precision rounded-lg bg-card p-5 ${completed ? "border border-positive/20" : ""}`}>
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{goal.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {completed ? "Objetivo de ahorro alcanzado (100%)" : `${months} meses restantes · Fecha límite: ${goal.deadline}`}
                      </p>
                    </div>
                    {completed && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-positive">
                        <Check className="h-3.5 w-3.5 text-positive-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="font-mono-nums text-lg font-semibold text-foreground">{fmt(goal.current)}</span>
                    <span className="font-mono-nums text-sm text-muted-foreground">{fmt(goal.target)}</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="mb-2 h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(1)}% completado</span>
                    {!completed && <span>Faltan {fmt(remaining)}</span>}
                  </div>
                  {!completed && goal.monthlyContribution > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Contribución mensual: <span className="font-mono-nums font-medium text-foreground">{fmt(goal.monthlyContribution)}</span>
                      {months > 0 && ` · Estimado: ${Math.ceil(remaining / goal.monthlyContribution)} meses`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Metas;
