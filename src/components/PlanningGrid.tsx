import { useRef, useEffect, useState } from "react";
import { CategoryRow, PLAN_MONTHS } from "@/hooks/useFinanceData";

interface PlanningGridProps {
  data: CategoryRow[];
  onCellUpdate: (rowIdx: number, colIdx: number, value: number) => void;
}

const formatCurrency = (val: number | null) => {
  if (val === null) return "—";
  return `$${val.toLocaleString("en-US")}`;
};

const PlanningGrid = ({ data, onCellUpdate }: PlanningGridProps) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    setEditingCell({ row: rowIdx, col: colIdx });
  };

  const handleCellChange = (value: string) => {
    if (!editingCell) return;
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(numValue)) return;
    onCellUpdate(editingCell.row, editingCell.col, numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const nextCol = editingCell.col + 1;
      if (nextCol < PLAN_MONTHS.length) {
        setEditingCell({ row: editingCell.row, col: nextCol });
      } else {
        setEditingCell(null);
      }
    }
    if (e.key === "Escape") setEditingCell(null);
  };

  const incomeRows = data.filter((r) => r.type === "income");
  const expenseRows = data.filter((r) => r.type === "expense");

  const getMonthTotal = (rows: CategoryRow[], colIdx: number) =>
    rows.reduce((sum, r) => sum + (r.values[colIdx] ?? 0), 0);

  const getBalance = (colIdx: number) =>
    getMonthTotal(incomeRows, colIdx) - getMonthTotal(expenseRows, colIdx);

  const renderRow = (row: CategoryRow, globalIdx: number) => (
    <tr key={row.category} className="group">
      <td className="sticky left-0 z-10 bg-card px-3 py-2 text-sm font-medium text-foreground">
        {row.category}
      </td>
      {row.values.map((val, colIdx) => {
        const isEditing = editingCell?.row === globalIdx && editingCell?.col === colIdx;
        return (
          <td
            key={colIdx}
            className="relative cursor-pointer px-0 py-0 transition-colors hover:bg-muted"
            onClick={() => handleCellClick(globalIdx, colIdx)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                defaultValue={val?.toString() ?? ""}
                className="w-full bg-muted px-3 py-2 text-right font-mono-nums text-sm font-medium text-foreground outline-none ring-1 ring-foreground"
                onChange={(e) => handleCellChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => setEditingCell(null)}
              />
            ) : (
              <div className="px-3 py-2 text-right font-mono-nums text-sm text-foreground">
                {formatCurrency(val)}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="shadow-precision overflow-hidden rounded-lg bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Planificación multi-mes</h2>
        <span className="text-xs text-muted-foreground">Abr 2026 — Mar 2027 · Haz clic en una celda para editar</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="sticky left-0 z-10 bg-muted px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categoría
              </th>
              {PLAN_MONTHS.map((m) => (
                <th key={m} className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={PLAN_MONTHS.length + 1} className="bg-positive-muted px-3 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-positive">Ingresos</span>
              </td>
            </tr>
            {incomeRows.map((row) => renderRow(row, data.indexOf(row)))}
            <tr className="border-t border-border bg-muted">
              <td className="sticky left-0 z-10 bg-muted px-3 py-2 text-sm font-semibold text-foreground">
                Total ingresos
              </td>
              {PLAN_MONTHS.map((_, colIdx) => (
                <td key={colIdx} className="px-3 py-2 text-right font-mono-nums text-sm font-semibold text-positive">
                  {formatCurrency(getMonthTotal(incomeRows, colIdx))}
                </td>
              ))}
            </tr>
            <tr>
              <td colSpan={PLAN_MONTHS.length + 1} className="bg-negative-muted px-3 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-negative">Gastos</span>
              </td>
            </tr>
            {expenseRows.map((row) => renderRow(row, data.indexOf(row)))}
            <tr className="border-t border-border bg-muted">
              <td className="sticky left-0 z-10 bg-muted px-3 py-2 text-sm font-semibold text-foreground">
                Total gastos
              </td>
              {PLAN_MONTHS.map((_, colIdx) => (
                <td key={colIdx} className="px-3 py-2 text-right font-mono-nums text-sm font-semibold text-negative">
                  {formatCurrency(getMonthTotal(expenseRows, colIdx))}
                </td>
              ))}
            </tr>
            <tr className="border-t-2 border-foreground bg-card">
              <td className="sticky left-0 z-10 bg-card px-3 py-3 text-sm font-bold text-foreground">
                Balance neto
              </td>
              {PLAN_MONTHS.map((_, colIdx) => {
                const balance = getBalance(colIdx);
                return (
                  <td
                    key={colIdx}
                    className={`px-3 py-3 text-right font-mono-nums text-sm font-bold ${
                      balance >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {balance >= 0 ? "+" : ""}
                    {formatCurrency(balance)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningGrid;
