import {
  sampleScalarKeyframes,
  sampleVec3Keyframes,
  type Keyframe,
  type Vec3,
} from "./keyframes";
import { easeInCubic, easeInOutCubic, easeOutCubic } from "./math";

/**
 * Chapter 1 "Launch" choreography — every track below is sampled with
 * LAUNCH-LOCAL progress (0→1 across global 0→0.15). The camera's side of
 * this same film lives in cameraTimeline.ts (global progress domain);
 * beat timings here and there must agree, so both cite the same beat
 * sheet:
 *
 *   local 0.00–0.30  PAD      rocket at rest; ignition ramps 0.10→0.25
 *   local 0.30–0.60  LIFTOFF  acceleration off the pad (ease-in cubic)
 *   local 0.60–1.00  ASCENT   full-speed climb + gravity-turn tilt
 *   local 0.82–0.97  MECO     engine throttles to cutoff
 *   local 1.00       ORBIT    coasting pose, held for the rest of scroll
 *
 * Scale story: Earth is radius 3, the rocket ~1.86 tall — at full size it
 * would be half a planet-radius of rocket. Scaling the whole rocket group
 * to 0.5 keeps it a readable hero up close while the planet still dwarfs
 * it in the orbit vista. Stylized, not to scale — to scale it would be
 * subpixel.
 */

export const ROCKET_SCALE = 0.5;

/**
 * Pad sits at the world-space top of the sphere (surface radius 3). The
 * rocket points +Y there, so no radial re-orientation is needed. Earth's
 * visual axial tilt puts this point at a subarctic latitude, which reads
 * as a northern launch site.
 */
const PAD: Vec3 = [0, 3, 0];

/** Ignition ramp over launch-local progress. */
export const IGNITION_START = 0.1;
export const IGNITION_FULL = 0.25;

/**
 * Engine throttle envelope (0→1): the single source both the exhaust
 * plume and the flame light derive from, so the engine lights, burns and
 * cuts off on the same scroll ticks everywhere. Fast attack at ignition
 * (engines light abruptly), full burn through ascent, then MECO — the
 * cutoff that turns the orbit vista's rocket into a coasting speck.
 */
const ENGINE_THROTTLE: readonly Keyframe<number>[] = [
  { t: 0, value: 0 },
  { t: IGNITION_START, value: 0, ease: easeOutCubic },
  { t: IGNITION_FULL, value: 1 },
  { t: 0.82, value: 1, ease: easeInOutCubic },
  { t: 0.97, value: 0 },
];

export function sampleEngineThrottle(local: number): number {
  return sampleScalarKeyframes(ENGINE_THROTTLE, local);
}

/**
 * Flight path. Velocity is continuous across the liftoff→ascent boundary
 * by construction: easeInCubic ends at 3× its segment's average slope, so
 * segment A (Δy 0.9 over Δt 0.3 → end slope 9) hands off to the linear
 * segment B (Δy 3.6 over Δt 0.4 → slope 9) with no visible speed hitch.
 * The small +x drift is the start of a gravity turn, matched by the tilt
 * track below.
 */
const ROCKET_PATH: readonly Keyframe<Vec3>[] = [
  { t: 0.0, value: PAD },
  { t: 0.3, value: PAD, ease: easeInCubic },
  { t: 0.6, value: [0.05, 3.9, 0] },
  { t: 1.0, value: [0.85, 7.5, 0] },
];

/** Gravity-turn lean (radians around Z, negative = toward +x downrange). */
const ROCKET_TILT: readonly Keyframe<number>[] = [
  { t: 0.0, value: 0 },
  { t: 0.55, value: 0, ease: easeInOutCubic },
  { t: 1.0, value: -0.16 },
];

/**
 * Lighting keyframe track: the warm nozzle point light is the throttle
 * envelope scaled to a peak intensity — flame brightness and plume are
 * one signal by construction.
 */
const FLAME_LIGHT_MAX = 6;

export interface RocketPose {
  position: Vec3;
  /** rotation.z of the rocket group (lean about the base). */
  tiltZ: number;
}

export function sampleRocketPose(local: number): RocketPose {
  return {
    position: sampleVec3Keyframes(ROCKET_PATH, local),
    tiltZ: sampleScalarKeyframes(ROCKET_TILT, local),
  };
}

export function sampleFlameIntensity(local: number): number {
  return FLAME_LIGHT_MAX * sampleEngineThrottle(local);
}

/**
 * Overlay text fade-out windows (launch-local progress). Both start fully
 * visible at local 0 — the hint has to be, since nothing else invites the
 * first scroll. The hint disappears almost immediately once scrolling
 * starts (its job is done); the identity block lingers long enough to
 * read, then clears before the ignition push-in camera beat (local 0.18)
 * so that close-up isn't fighting text.
 */
export const OVERLAY_HINT_FADE = { start: 0, end: 0.05 };
export const OVERLAY_IDENTITY_FADE = { start: 0.05, end: 0.16 };
