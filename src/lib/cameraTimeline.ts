import { CHAPTERS } from "./chapters";
import {
  lerpVec3,
  sampleKeyframes,
  type Keyframe,
  type Vec3,
} from "./keyframes";
import { easeInOutCubic } from "./math";

/**
 * The camera path is DATA, not code: an ordered list of keyframes over
 * GLOBAL progress. The rig samples this timeline every frame; no chapter
 * ever moves the camera itself. To change the flight path you edit this
 * file only.
 *
 * Chapter 1 "Launch" choreography (camera side of the beat sheet shared
 * with launchTimeline.ts — keyframe times below are authored as fractions
 * of the launch range so the two stay aligned):
 *
 *   pad hero → ignition push-in → liftoff → ascent chase → orbit vista
 *
 * lookAt targets approximate the rocket's keyframed position at the same
 * beat (they can't literally track it — this is data, not a reference);
 * the rig's damping hides the small in-between mismatch.
 */

export interface CameraPose {
  position: Vec3;
  lookAt: Vec3;
}

export type CameraKeyframe = Keyframe<CameraPose>;

/** Launch chapter length in global progress — camera beats scale with it. */
const L = CHAPTERS.launch.end;

export const CAMERA_TIMELINE: readonly CameraKeyframe[] = [
  // PAD HERO (local 0): eye level with the rocket on its subarctic pad,
  // horizon curving away below.
  {
    t: 0,
    value: { position: [0, 3.55, 2.9], lookAt: [0, 3.42, 0] },
    ease: easeInOutCubic,
  },
  // IGNITION PUSH-IN (local 0.18): drop low and close, looking up at the
  // nose as the engine lights (ignition ramp is local 0.10–0.25).
  {
    t: 0.18 * L,
    value: { position: [0.85, 3.18, 1.85], lookAt: [0, 3.55, 0] },
    ease: easeInOutCubic,
  },
  // LIFTOFF (local 0.42): pull back and aside as the rocket leaves the pad.
  {
    t: 0.42 * L,
    value: { position: [1.55, 3.35, 2.45], lookAt: [0.02, 3.75, 0] },
    ease: easeInOutCubic,
  },
  // ASCENT CHASE (local 0.70): climbing with it — rocket upper frame,
  // flame trailing, Earth's limb glowing at the bottom edge for scale.
  {
    t: 0.7 * L,
    value: { position: [2.0, 4.5, 3.3], lookAt: [0.3, 4.4, 0] },
    ease: easeInOutCubic,
  },
  // ORBIT VISTA (local 1.0 = end of Launch): wide pull-back — the planet
  // owns the frame, the rocket a coasting speck upper-left after MECO.
  {
    t: L,
    value: { position: [5.6, 6.9, 10.6], lookAt: [0.4, 4.35, 0] },
  },
  // Hold the vista for the rest of the scroll until later chapters claim
  // their ranges (frozen until the decision gate).
  {
    t: 1,
    value: { position: [5.6, 6.9, 10.6], lookAt: [0.4, 4.35, 0] },
  },
];

function lerpPose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    position: lerpVec3(a.position, b.position, t),
    lookAt: lerpVec3(a.lookAt, b.lookAt, t),
  };
}

/**
 * Sample the timeline at global progress p. Pure function of p → pose,
 * which is what makes scroll perfectly reversible.
 */
export function sampleCameraTimeline(
  p: number,
  timeline: readonly CameraKeyframe[] = CAMERA_TIMELINE
): CameraPose {
  return sampleKeyframes(timeline, p, lerpPose);
}
