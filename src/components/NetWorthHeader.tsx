import { TrendingUp, TrendingDown } from "lucide-react";

interface NetWorthHeaderProps {
  netWorth: number;
  monthDelta: number;
  monthDeltaPercent: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const NetWorthHeader = ({ netWorth, monthDelta, monthDeltaPercent }: NetWorthHeaderProps) => {
  const isPositive = monthDelta >= 0;

  return (
    <div className="flex items-end gap-8">
      <div>
        <p className="label-caps mb-1">Patrimonio neto</p>
        <p className="font-mono-nums text-2xl font-semibold tracking-tight text-foreground">
          {formatCurrency(netWorth)}
        </p>
      </div>
      <div className="flex items-center gap-2 pb-0.5">
        <div
          className={`flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${
            isPositive ? "bg-positive-muted text-positive" : "bg-negative-muted text-negative"
          }`}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}
          {monthDeltaPercent.toFixed(1)}%
        </div>
        <span className="font-mono-nums text-sm text-muted-foreground">
          {isPositive ? "+" : ""}
          {formatCurrency(monthDelta)} este mes
        </span>
      </div>
    </div>
  );
};

export default NetWorthHeader;
