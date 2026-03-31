import { useState, useCallback, useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────
export type QuadrantId = "C1" | "C2" | "C3" | "C4";

export interface ShoppingItem {
  id: string;
  name: string;
  quadrant: QuadrantId;
  estimatedBudget?: number;
  createdAt: string;
}

export interface QuadrantMeta {
  id: QuadrantId;
  label: string;
  description: string;
  colorClass: string;       // Tailwind bg class for the header accent
  borderClass: string;      // Tailwind border class for the card
  badgeBg: string;          // Tailwind bg for badge
  badgeText: string;        // Tailwind text for badge
}

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "C1",
    label: "Comprar ahora",
    description: "Urgente + Importante",
    colorClass: "bg-destructive",
    borderClass: "border-destructive/30",
    badgeBg: "bg-destructive",
    badgeText: "text-destructive-foreground",
  },
  {
    id: "C2",
    label: "Planificar",
    description: "Importante, no urgente",
    colorClass: "bg-yellow-500",
    borderClass: "border-yellow-500/30",
    badgeBg: "bg-yellow-500",
    badgeText: "text-white",
  },
  {
    id: "C3",
    label: "Delegar / agrupar",
    description: "Urgente, no importante",
    colorClass: "bg-sky-500",
    borderClass: "border-sky-500/30",
    badgeBg: "bg-sky-500",
    badgeText: "text-white",
  },
  {
    id: "C4",
    label: "Opcional / eliminar",
    description: "No urgente, no importante",
    colorClass: "bg-muted-foreground",
    borderClass: "border-muted-foreground/30",
    badgeBg: "bg-muted-foreground",
    badgeText: "text-background",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getStorageKey(monthKey: string): string {
  return `vault-shopping-list-${monthKey}`;
}

function getArchiveKey(monthKey: string): string {
  return `vault-shopping-archive-${monthKey}`;
}

function loadItems(monthKey: string): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(monthKey));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(monthKey: string, items: ShoppingItem[]) {
  localStorage.setItem(getStorageKey(monthKey), JSON.stringify(items));
}

function archiveIfNeeded(currentMonthKey: string) {
  // Look for keys from previous months and archive them
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("vault-shopping-list-") && !key.endsWith(currentMonthKey)) {
      const oldMonthKey = key.replace("vault-shopping-list-", "");
      const archiveKey = getArchiveKey(oldMonthKey);
      // Only archive if not already archived
      if (!localStorage.getItem(archiveKey)) {
        const data = localStorage.getItem(key);
        if (data) {
          localStorage.setItem(archiveKey, data);
        }
      }
      localStorage.removeItem(key);
    }
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useListaCompras() {
  const now = new Date();
  const monthKey = getMonthKey(now);

  // Archive old months on first render
  useState(() => {
    archiveIfNeeded(monthKey);
  });

  const [items, setItems] = useState<ShoppingItem[]>(() => loadItems(monthKey));

  // Persist to localStorage whenever items change
  const persist = useCallback(
    (newItems: ShoppingItem[]) => {
      setItems(newItems);
      saveItems(monthKey, newItems);
    },
    [monthKey]
  );

  const addItem = useCallback(
    (name: string, quadrant: QuadrantId, estimatedBudget?: number) => {
      const newItem: ShoppingItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        quadrant,
        estimatedBudget: estimatedBudget && estimatedBudget > 0 ? estimatedBudget : undefined,
        createdAt: new Date().toISOString(),
      };
      persist([...items, newItem]);
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((item) => item.id !== id));
    },
    [items, persist]
  );

  const moveItem = useCallback(
    (id: string, targetQuadrant: QuadrantId) => {
      persist(
        items.map((item) =>
          item.id === id ? { ...item, quadrant: targetQuadrant } : item
        )
      );
    },
    [items, persist]
  );

  const getItemsByQuadrant = useCallback(
    (quadrant: QuadrantId) => items.filter((item) => item.quadrant === quadrant),
    [items]
  );

  const currentMonthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const c1PendingCount = useMemo(
    () => items.filter((item) => item.quadrant === "C1").length,
    [items]
  );

  const totalEstimatedBudget = useMemo(
    () => items.reduce((sum, item) => sum + (item.estimatedBudget ?? 0), 0),
    [items]
  );

  return {
    items,
    addItem,
    removeItem,
    moveItem,
    getItemsByQuadrant,
    currentMonthLabel,
    c1PendingCount,
    totalEstimatedBudget,
  };
}
