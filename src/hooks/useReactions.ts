"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import type { ReactionType, ReactionTotals } from "@/types";

const DEFAULT_TOTALS: ReactionTotals = {
  like: 0,
  funny: 0,
  nice: 0,
  sad: 0,
  angry: 0,
  fire: 0,
  mykisah: 0,
  gokil: 0,
  love: 0,
  moai: 0,
};

export function useReactions({ slug, chapterIndex }: { slug: string; chapterIndex?: number }) {
  const { user } = useAuth();
  const [totals, setTotals] = useState<ReactionTotals>(DEFAULT_TOTALS);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReactions = useCallback(async () => {
    const params = new URLSearchParams({ slug });
    if (chapterIndex !== undefined) params.set("chapter", String(chapterIndex));
    try {
      const res = await fetch(`/api/reactions?${params}`);
      const d = await res.json();
      setTotals(d.data?.totals ?? DEFAULT_TOTALS);
      setUserReaction(d.data?.userReaction ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug, chapterIndex]);

  useEffect(() => { fetchReactions(); }, [fetchReactions]);

  const react = useCallback(async (type: ReactionType) => {
    if (!user) { toast.error("Please login to react"); return; }

    const newType: ReactionType | null = userReaction === type ? null : type;

    // Optimistic
    setTotals((prev) => {
      const next = { ...prev };
      if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
      if (newType) next[newType] = next[newType] + 1;
      return next;
    });
    setUserReaction(newType);

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type: newType, chapterIndex }),
      });
    } catch {
      fetchReactions(); // revert
    }
  }, [user, userReaction, slug, chapterIndex, fetchReactions]);

  return { totals, userReaction, loading, react };
}
