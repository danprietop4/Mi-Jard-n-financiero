import AppSidebar from "@/components/AppSidebar";
import NetWorthHeader from "@/components/NetWorthHeader";
import QuickStats from "@/components/QuickStats";
import FinanceChart from "@/components/FinanceChart";
import PlanningGrid from "@/components/PlanningGrid";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useListaCompras } from "@/hooks/useListaCompras";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const finance = useFinanceData();
  const { c1PendingCount } = useListaCompras();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          <NetWorthHeader
            netWorth={finance.netWorth}
            monthDelta={finance.monthDelta}
            monthDeltaPercent={finance.monthDeltaPercent}
          />
          <QuickStats
            currentIncome={finance.currentIncome}
            currentExpense={finance.currentExpense}
            currentSavings={finance.currentSavings}
            savingsRate={finance.savingsRate}
            incomeChange={finance.incomeChange}
            expenseChange={finance.expenseChange}
            savingsChange={finance.savingsChange}
            savingsRateChange={finance.savingsRateChange}
          />
          {c1PendingCount > 0 && (
            <Link to="/lista-compras" className="block">
              <div className="shadow-precision flex items-center gap-3 rounded-lg bg-card p-4 transition-colors hover:bg-accent">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-destructive/10">
                  <ShoppingCart className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {c1PendingCount} {c1PendingCount === 1 ? "artículo" : "artículos"} por comprar ahora
                  </p>
                  <p className="text-xs text-muted-foreground">Ítems urgentes e importantes pendientes</p>
                </div>
              </div>
            </Link>
          )}
          <FinanceChart chartData={finance.chartData} />
          <PlanningGrid data={finance.data} onCellUpdate={finance.updateCell} />
        </div>
      </main>
    </div>
  );
};

export default Index;
