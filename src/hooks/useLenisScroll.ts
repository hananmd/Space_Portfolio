"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useScrollStore } from "@/stores/scrollStore";

/**
 * Boots Lenis smooth scrolling on the window and feeds normalized progress
 * (0→1) into the scroll store.
 *
 * Load-bearing rule: nothing in the app listens to wheel/scroll events
 * directly. Lenis smooths the raw input, and the ONLY thing we export from
 * that smoothing is `scroll / limit` — a single normalized number.
 */
export function useLenisScroll(): void {
  const setProgress = useScrollStore((s) => s.setProgress);

  useEffect(() => {
    const lenis = new Lenis({
      // Same smoothing curve for wheel and trackpad; Lenis normalizes
      // delta differences between the two input types internally.
      smoothWheel: true,
    });

    const onScroll = (l: Lenis) => {
      // limit = total scrollable distance; 0 while layout hasn't settled.
      setProgress(l.limit > 0 ? l.scroll / l.limit : 0);
    };
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Sync once on mount so a page restored mid-scroll reports correctly.
    onScroll(lenis);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [setProgress]);
}
