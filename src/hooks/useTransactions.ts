import { useState, useCallback } from "react";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number; // Amount in Bs
}

const STORAGE_KEY = "vault-transactions";

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const next = [{ ...tx, id: Date.now().toString() }, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { transactions, addTransaction, removeTransaction };
}
