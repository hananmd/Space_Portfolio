"use client";

import { useEffect, useRef } from "react";
import { chapterProgress } from "@/lib/chapters";
import { OVERLAY_HINT_FADE, OVERLAY_IDENTITY_FADE } from "@/lib/launchTimeline";
import { remapProgress } from "@/lib/math";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/stores/scrollStore";
import { IDENTITY } from "@/content/identity";
import styles from "./LaunchOverlay.module.css";

/** Opacity falls from 1 to 0 across [start, end] of local progress. */
function fadeOutOpacity(local: number, start: number, end: number): number {
  return 1 - remapProgress(start, end, local);
}

/**
 * Launch chapter's DOM overlay: name, title, tagline, "scroll to begin"
 * hint. Copy comes only from content/identity.ts (mirrored from
 * content.md). Opacity is a pure function of scroll progress, applied by
 * writing directly to refs from a store subscription — same getState()
 * pattern the camera rig and rocket use in the canvas, so a 165Hz scroll
 * tick never triggers a React re-render here.
 */
export function LaunchOverlay() {
  const identityRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const applyOpacity = (progress: number) => {
      const local = chapterProgress("launch", progress);
      if (identityRef.current) {
        identityRef.current.style.opacity = String(
          fadeOutOpacity(local, OVERLAY_IDENTITY_FADE.start, OVERLAY_IDENTITY_FADE.end)
        );
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          fadeOutOpacity(local, OVERLAY_HINT_FADE.start, OVERLAY_HINT_FADE.end)
        );
      }
    };

    applyOpacity(useScrollStore.getState().progress);
    return useScrollStore.subscribe((s) => applyOpacity(s.progress));
  }, []);

  return (
    <div className={styles.wrap}>
      <div
        ref={identityRef}
        className={reducedMotion ? styles.identity : `${styles.identity} ${styles.animated}`}
      >
        <h1 className={styles.name}>{IDENTITY.name}</h1>
        <p className={styles.subtitle}>{IDENTITY.subtitle}</p>
        <p className={styles.tagline}>{IDENTITY.tagline}</p>
      </div>
      <p
        ref={hintRef}
        className={reducedMotion ? styles.hint : `${styles.hint} ${styles.animated}`}
      >
        {IDENTITY.scrollHint}
      </p>
    </div>
  );
}
