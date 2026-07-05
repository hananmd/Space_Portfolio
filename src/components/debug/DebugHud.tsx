"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTER_IDS, CHAPTERS, chapterProgress } from "@/lib/chapters";
import { useScrollStore } from "@/stores/scrollStore";

/**
 * Dev-only HUD: global progress, per-chapter local progress, FPS.
 * Toggle with the `d` key. Subscribes to the store (re-renders on scroll),
 * which is fine here because it never ships to production.
 */
export function DebugHud() {
  const [visible, setVisible] = useState(true);
  const progress = useScrollStore((s) => s.progress);
  const [fps, setFps] = useState(0);
  const frames = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "d" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    const tick = () => {
      frames.current += 1;
      const now = performance.now();
      // Update the displayed number twice a second, not per frame.
      if (now - last >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last)));
        frames.current = 0;
        last = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (process.env.NODE_ENV !== "development" || !visible) return null;

  return (
    <div
      data-testid="debug-hud"
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 1000,
        padding: "10px 14px",
        background: "rgba(0, 0, 0, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: 8,
        color: "#9fd0ff",
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: 12,
        lineHeight: 1.7,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      <div data-testid="hud-global">
        global {progress.toFixed(4)} · {fps} fps
      </div>
      {CHAPTER_IDS.map((id) => {
        const local = chapterProgress(id, progress);
        const active = local > 0 && local < 1;
        return (
          <div
            key={id}
            data-testid={`hud-${id}`}
            style={{ color: active ? "#3dffb5" : "#556277" }}
          >
            {CHAPTERS[id].label.padEnd(14)} {local.toFixed(3)}
          </div>
        );
      })}
    </div>
  );
}
