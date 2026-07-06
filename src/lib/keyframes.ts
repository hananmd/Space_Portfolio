import { clamp01, easeLinear, lerp, type EasingFn } from "./math";

/**
 * Generic keyframe track sampling.
 *
 * Choreography in this project is DATA: an ordered list of keyframes over
 * a normalized 0→1 progress domain, sampled every frame. This module is
 * the ONE sampler behind all of it — camera poses, the rocket's flight
 * path, light intensities — so interpolation behavior (clamping at the
 * ends, per-segment easing) is identical everywhere and defined once.
 *
 * Sampling is a pure function of progress → value, which is what makes
 * scroll perfectly reversible: scrolling back replays the exact same
 * values in reverse.
 */

export type Vec3 = readonly [number, number, number];

export interface Keyframe<T> {
  /** Progress (0→1 in the track's domain) at which the track equals `value`. */
  t: number;
  value: T;
  /** Easing applied across the segment that STARTS at this keyframe. */
  ease?: EasingFn;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** Offset a point by a vector — used to derive a camera pose from a
 *  planet's world position without hand-copying its coordinates. */
export function addVec3(a: Vec3, offset: Vec3): Vec3 {
  return [a[0] + offset[0], a[1] + offset[1], a[2] + offset[2]];
}

/**
 * Sample a track at progress p. Values before the first / after the last
 * keyframe clamp to the end keyframes, so a track can "hold" simply by
 * ending early.
 */
export function sampleKeyframes<T>(
  track: readonly Keyframe<T>[],
  p: number,
  lerpValue: (a: T, b: T, t: number) => T
): T {
  const clamped = clamp01(p);
  const first = track[0];
  const last = track[track.length - 1];

  if (clamped <= first.t) return first.value;
  if (clamped >= last.t) return last.value;

  // Find the segment [a, b] containing p. Tracks are short (a handful of
  // keyframes), so a linear scan is clearer and fast enough.
  let a = first;
  let b = last;
  for (let i = 0; i < track.length - 1; i++) {
    if (clamped >= track[i].t && clamped <= track[i + 1].t) {
      a = track[i];
      b = track[i + 1];
      break;
    }
  }

  const segT = (clamped - a.t) / (b.t - a.t);
  return lerpValue(a.value, b.value, (a.ease ?? easeLinear)(segT));
}

export function sampleScalarKeyframes(
  track: readonly Keyframe<number>[],
  p: number
): number {
  return sampleKeyframes(track, p, lerp);
}

export function sampleVec3Keyframes(
  track: readonly Keyframe<Vec3>[],
  p: number
): Vec3 {
  return sampleKeyframes(track, p, lerpVec3);
}
