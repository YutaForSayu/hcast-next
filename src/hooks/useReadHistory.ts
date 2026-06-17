"use client";

import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry } from "@/types";

const STORAGE_KEY = "hcast_history";
const MAX_ENTRIES = 100;

function readStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function writeStorage(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  catch { /* quota exceeded */ }
}

export function useReadHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => { setHistory(readStorage()); }, []);

  const record = useCallback((entry: Omit<HistoryEntry, "time">) => {
    const newEntry: HistoryEntry = { ...entry, time: new Date().toISOString() };
    setHistory((prev) => {
      const filtered = prev.filter(
        (h) => !(h.slug === entry.slug && h.chapter === entry.chapter)
      );
      const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
      writeStorage(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => { writeStorage([]); setHistory([]); }, []);

  const remove = useCallback((slug: string, chapter: number) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => !(h.slug === slug && h.chapter === chapter));
      writeStorage(updated);
      return updated;
    });
  }, []);

  const hasRead = useCallback(
    (slug: string, chapter: number) => history.some((h) => h.slug === slug && h.chapter === chapter),
    [history]
  );

  const lastRead = useCallback(
    (slug: string) => history.find((h) => h.slug === slug) ?? null,
    [history]
  );

  return { history, record, clear, remove, hasRead, lastRead };
}
