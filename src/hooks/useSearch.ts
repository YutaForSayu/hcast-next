"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { SeriesData } from "@/lib/api";

export function useSearch(query: string, delay = 400) {
  const [results, setResults] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.search(query, 1, 8);
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [query, delay]);

  return { results, loading };
}
