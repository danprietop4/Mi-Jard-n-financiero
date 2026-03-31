import { useState, useRef, type DragEvent } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useListaCompras, QUADRANTS, type QuadrantId } from "@/hooks/useListaCompras";
import { Plus, X, ShoppingCart, GripVertical, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const ListaDeCompras = () => {
  const {
    addItem,
    removeItem,
    moveItem,
    getItemsByQuadrant,
    currentMonthLabel,
    totalEstimatedBudget,
  } = useListaCompras();

  // Drawer form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuadrant, setNewQuadrant] = useState<QuadrantId>("C1");
  const [newBudget, setNewBudget] = useState("");

  // Drag state
  const [dragOverQuadrant, setDragOverQuadrant] = useState<QuadrantId | null>(null);
  const dragItemId = useRef<string | null>(null);

  const handleDragStart = (e: DragEvent, itemId: string) => {
    dragItemId.current = itemId;
    e.dataTransfer.effectAllowed = "move";
    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    dragItemId.current = null;
    setDragOverQuadrant(null);
  };

  const handleDragOver = (e: DragEvent, quadrantId: QuadrantId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverQuadrant(quadrantId);
  };

  const handleDragLeave = () => {
    setDragOverQuadrant(null);
  };

  const handleDrop = (e: DragEvent, quadrantId: QuadrantId) => {
    e.preventDefault();
    setDragOverQuadrant(null);
    if (dragItemId.current) {
      moveItem(dragItemId.current, quadrantId);
      dragItemId.current = null;
    }
  };

  const handleAddItem = () => {
    if (!newName.trim()) return;
    const budget = parseFloat(newBudget);
    addItem(newName, newQuadrant, isNaN(budget) ? undefined : budget);
    setNewName("");
    setNewBudget("");
    setNewQuadrant("C1");
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-4 p-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Lista de Compras
              </h1>
              <p className="text-sm text-muted-foreground">
                Organiza tus compras con la Matriz de Eisenhower
              </p>
            </div>
            <div className="flex items-center gap-3">
              {totalEstimatedBudget > 0 && (
                <div className="flex items-center gap-1.5 rounded-sm bg-muted px-3 py-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono-nums text-sm font-medium text-foreground">
                    {fmt(totalEstimatedBudget)}
                  </span>
                  <span className="text-xs text-muted-foreground">estimado</span>
                </div>
              )}
              <div className="rounded-sm bg-foreground px-3 py-1.5">
                <span className="text-sm font-medium text-background">{currentMonthLabel}</span>
              </div>
            </div>
          </div>

          {/* 2×2 Eisenhower Grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUADRANTS.map((q) => {
              const quadrantItems = getItemsByQuadrant(q.id);
              const isOver = dragOverQuadrant === q.id;

              return (
                <div
                  key={q.id}
                  className={`shadow-precision flex flex-col rounded-lg border bg-card transition-all ${q.borderClass} ${
                    isOver ? "ring-2 ring-ring scale-[1.01]" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, q.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, q.id)}
                >
                  {/* Quadrant header */}
                  <div className={`flex items-center justify-between rounded-t-lg px-4 py-3 ${q.colorClass}`}>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{q.label}</h3>
                      <p className="text-xs text-white/70">{q.description}</p>
                    </div>
                    <Badge
                      className={`${q.badgeBg} ${q.badgeText} border-white/20 text-xs tabular-nums`}
                    >
                      {quadrantItems.length}
                    </Badge>
                  </div>

                  {/* Items list */}
                  <div className="flex-1 overflow-y-auto p-3 quadrant-scroll" style={{ maxHeight: "280px", minHeight: "120px" }}>
                    {quadrantItems.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-xs text-muted-foreground">
                          Arrastra ítems aquí o usa + para agregar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {quadrantItems.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className="group flex items-center gap-2 rounded-sm border border-border/50 bg-background px-3 py-2 transition-all hover:border-border hover:shadow-sm cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            <span className="flex-1 text-sm text-foreground truncate">
                              {item.name}
                            </span>
                            {item.estimatedBudget != null && (
                              <span className="font-mono-nums text-xs text-muted-foreground shrink-0">
                                {fmt(item.estimatedBudget)}
                              </span>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 rounded-sm p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating add button + Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="Agregar ítem"
            >
              <Plus className="h-6 w-6" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Agregar ítem</DrawerTitle>
              <DrawerDescription>
                Agrega un artículo a tu lista de compras del mes
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4 px-4">
              {/* Item name */}
              <div>
                <label htmlFor="item-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nombre del artículo
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem();
                  }}
                  placeholder="Ej. Leche, Paracetamol..."
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  autoFocus
                />
              </div>

              {/* Quadrant selector */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Cuadrante
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUADRANTS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setNewQuadrant(q.id)}
                      className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-left text-sm transition-all ${
                        newQuadrant === q.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-foreground hover:border-foreground/50"
                      }`}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${q.colorClass}`} />
                      <span className="font-medium">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated budget */}
              <div>
                <label htmlFor="item-budget" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Presupuesto estimado (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <input
                    id="item-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem();
                    }}
                    placeholder="0.00"
                    className="w-full rounded-sm border border-border bg-background py-2 pl-7 pr-3 font-mono-nums text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <button
                onClick={handleAddItem}
                disabled={!newName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity disabled:opacity-40"
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar a {QUADRANTS.find((q) => q.id === newQuadrant)?.label}
              </button>
              <DrawerClose asChild>
                <button className="w-full rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
                  Cancelar
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </main>
    </div>
  );
};

export default ListaDeCompras;
