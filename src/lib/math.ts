/**
 * Pure math utilities. No Three.js imports here — these are plain-number
 * functions so they stay trivially unit-testable and usable anywhere
 * (camera, lighting, text opacity, audio volumes later).
 */

/** Clamp a value into [0, 1]. */
export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Linear interpolation between a and b by t (t is NOT clamped). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Remap global progress p into a local 0→1 progress for the range
 * [start, end]. Values outside the range clamp to 0 or 1, so a chapter
 * simply reads "how far through me are we" without knowing its neighbors.
 */
export function remapProgress(start: number, end: number, p: number): number {
  if (end <= start) return p >= end ? 1 : 0; // degenerate range guard
  return clamp01((p - start) / (end - start));
}

/**
 * Frame-rate independent exponential smoothing (Freya Holmér's damp).
 * Unlike `lerp(current, target, 0.1)` per frame, this converges at the
 * same speed at 30, 60 or 144 FPS because dt is in the exponent.
 * `lambda` ≈ responsiveness: higher = snappier.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * Deterministic PRNG (mulberry32). Same seed → same sequence, so the
 * starfield renders identically on every mount and hot reload instead of
 * re-shuffling like Math.random() would.
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Easing functions (input and output both 0→1) ---

export type EasingFn = (t: number) => number;

export const easeLinear: EasingFn = (t) => t;

/** Smooth start+end; the default "cinematic" ease for camera segments. */
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);

export const easeInCubic: EasingFn = (t) => t * t * t;

/** Hermite smoothstep — gentler than cubic, C1-continuous at both ends. */
export const easeSmoothstep: EasingFn = (t) => t * t * (3 - 2 * t);
