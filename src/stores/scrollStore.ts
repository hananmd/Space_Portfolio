import { create } from "zustand";

/**
 * Single source of truth for scroll progress.
 *
 * Two read paths, deliberately:
 * - React components (HUD, overlays) subscribe with a selector and re-render.
 * - Per-frame consumers (camera rig) call `useScrollStore.getState().progress`
 *   inside useFrame — no subscription, no re-render per scroll tick.
 */
interface ScrollState {
  /** Normalized scroll progress of the whole experience, 0→1. */
  progress: number;
  setProgress: (p: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: p }),
}));
