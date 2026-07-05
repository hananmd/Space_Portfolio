import {
  clamp01,
  easeInOutCubic,
  easeLinear,
  lerp,
  type EasingFn,
} from "./math";

/**
 * The camera path is DATA, not code: an ordered list of keyframes over
 * global progress. The rig samples this timeline every frame; no chapter
 * ever moves the camera itself. To change the flight path you edit this
 * file only.
 */

export type Vec3 = readonly [number, number, number];

export interface CameraKeyframe {
  /** Global progress (0→1) at which the camera sits exactly at this pose. */
  t: number;
  position: Vec3;
  /** Where the camera is looking when at this keyframe. */
  lookAt: Vec3;
  /** Easing applied across the segment that STARTS at this keyframe. */
  ease?: EasingFn;
}

export interface CameraPose {
  position: Vec3;
  lookAt: Vec3;
}

/**
 * Phase 1 test path: three dummy waypoints (plus a hold at the end) so we
 * can verify the engine — fly, turn, and reverse perfectly on scroll-up.
 * Real Chapter 1 choreography replaces this data in Phase 2.
 */
export const CAMERA_TIMELINE: readonly CameraKeyframe[] = [
  // Waypoint A — start: pulled back, looking at origin marker.
  { t: 0.0, position: [0, 2, 14], lookAt: [0, 0, 0], ease: easeInOutCubic },
  // Waypoint B — swing left and closer, look at the second marker.
  { t: 0.45, position: [-10, 4, 4], lookAt: [-6, 1, -4], ease: easeInOutCubic },
  // Waypoint C — rise high on the right, look at the far marker.
  { t: 0.9, position: [8, 9, -6], lookAt: [5, 0, -10], ease: easeLinear },
  // Hold the final pose for the last 10% so the end of the scroll is calm.
  { t: 1.0, position: [8, 9, -6], lookAt: [5, 0, -10] },
];

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Sample the timeline at global progress p.
 * Pure function of p → pose, which is what makes scroll perfectly
 * reversible: scrolling back replays the exact same poses in reverse.
 */
export function sampleCameraTimeline(
  p: number,
  timeline: readonly CameraKeyframe[] = CAMERA_TIMELINE
): CameraPose {
  const clamped = clamp01(p);
  const first = timeline[0];
  const last = timeline[timeline.length - 1];

  if (clamped <= first.t) return { position: first.position, lookAt: first.lookAt };
  if (clamped >= last.t) return { position: last.position, lookAt: last.lookAt };

  // Find the segment [a, b] containing p. Timeline is short (handful of
  // keyframes), so a linear scan is clearer and fast enough.
  let a = first;
  let b = last;
  for (let i = 0; i < timeline.length - 1; i++) {
    if (clamped >= timeline[i].t && clamped <= timeline[i + 1].t) {
      a = timeline[i];
      b = timeline[i + 1];
      break;
    }
  }

  const segT = (clamped - a.t) / (b.t - a.t);
  const eased = (a.ease ?? easeLinear)(segT);

  return {
    position: lerpVec3(a.position, b.position, eased),
    lookAt: lerpVec3(a.lookAt, b.lookAt, eased),
  };
}
