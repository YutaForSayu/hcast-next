"use client";
import { useReactions } from "@/hooks/useReactions";
import type { ReactionType } from "@/types";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like",    emoji: "👍", label: "Like"    },
  { type: "funny",   emoji: "😂", label: "Funny"   },
  { type: "nice",    emoji: "😍", label: "Nice"    },
  { type: "sad",     emoji: "😢", label: "Sad"     },
  { type: "angry",   emoji: "😡", label: "Angry"   },
  { type: "fire",    emoji: "🔥", label: "Fire"    },
  { type: "mykisah", emoji: "🥰", label: "MyKisah" },
  { type: "gokil",   emoji: "😹", label: "Gokil"   },
  { type: "love",    emoji: "❤️", label: "Love"    },
  { type: "moai",    emoji: "🗿", label: "Batu"    },
];

interface ReactionsBarProps {
  slug: string;
  chapterIndex?: number;
}

export function ReactionsBar({ slug, chapterIndex }: ReactionsBarProps) {
  const { user } = useAuth();
  const { totals, userReaction, loading, react } = useReactions({ slug, chapterIndex });

  if (loading) return <div className="skeleton h-12 rounded-xl" />;

  return (
    <div>
      <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
        How do you feel?
      </p>
      <div className="flex items-center flex-wrap gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.type}
            onClick={() => react(r.type)}
            title={r.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 select-none ${
              userReaction === r.type
                ? "bg-accent/20 border-accent/50 text-text-primary scale-105 shadow-glow-sm"
                : "bg-bg-elevated border-border hover:border-accent/40 hover:bg-bg-tertiary text-text-secondary"
            }`}
          >
            <span className="text-base leading-none">{r.emoji}</span>
            {totals[r.type] > 0 && (
              <span className="text-xs tabular-nums">{totals[r.type]}</span>
            )}
          </button>
        ))}
        {!user && (
          <Link
            href="/login"
            className="text-xs text-text-muted hover:text-accent transition-colors ml-1"
          >
            Login to react
          </Link>
        )}
      </div>
    </div>
  );
}
