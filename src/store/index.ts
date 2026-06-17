import { create } from "zustand";
import type { JWTPayload } from "@/lib/auth";

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  readerWidth: "narrow" | "normal" | "wide";
  setReaderWidth: (width: "narrow" | "normal" | "wide") => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  readerWidth: "normal",
  setReaderWidth: (readerWidth) => set({ readerWidth }),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
}));
