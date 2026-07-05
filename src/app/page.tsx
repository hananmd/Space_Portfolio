"use client";

import { Scene } from "@/components/canvas/Scene";
import { DebugHud } from "@/components/debug/DebugHud";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import styles from "./page.module.css";

/**
 * Page shell: a fixed full-viewport canvas, a tall invisible scroll track
 * that gives the browser real scroll distance (keyboard scrolling works
 * for free), and the dev HUD. Lenis smooths that native scroll and the
 * store turns it into the single 0→1 progress everything derives from.
 */
export default function Home() {
  useLenisScroll();

  return (
    <>
      <Scene />
      <main className={styles.overlay}>
        <h1 className={styles.srOnly}>Hanan — Space Portfolio</h1>
        {/* Skip-intro button slot — implemented in a later phase. */}
      </main>
      {/* 600vh ≈ 5 viewport-heights of travel; tune for scroll pacing. */}
      <div className={styles.track} aria-hidden="true" />
      <DebugHud />
    </>
  );
}
