import { CHAPTERS } from "./chapters";
import {
  addVec3,
  lerpVec3,
  sampleKeyframes,
  type Keyframe,
  type Vec3,
} from "./keyframes";
import { SOLAR_LAYOUT } from "./solarLayout";
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
 *
 * Chapter 2 "Solar" choreography (keyframe times authored as fractions of
 * the solar range, same convention): the camera glides from the Launch
 * orbit vista into a close hero shot on the systems-programming planet,
 * lingers there (content.md: HERO, "camera lingers longest"), then flies
 * past backend → databases → ai/rag in visit order. Camera positions are
 * derived from SOLAR_LAYOUT's planet positions via a fixed offset per
 * planet rather than copy-pasted coordinates, so the shot stays in sync
 * if the art direction in solarLayout.ts ever moves a planet. The two
 * exploring planets (system-design, mlops) deliberately get no camera
 * stop — solarLayout.ts already places them off this arc so they read as
 * distant background signal, not stops on the path.
 */

export interface CameraPose {
  position: Vec3;
  lookAt: Vec3;
}

export type CameraKeyframe = Keyframe<CameraPose>;

/** Launch chapter length in global progress — camera beats scale with it. */
const L = CHAPTERS.launch.end;

/** Solar chapter range in global progress — camera beats scale with it. */
const SOLAR_START = CHAPTERS.solar.start;
const SOLAR_SPAN = CHAPTERS.solar.end - CHAPTERS.solar.start;

/** Solar-local fraction f → global progress. */
function solarT(f: number): number {
  return SOLAR_START + f * SOLAR_SPAN;
}

/** A pose framing a planet: pulled back by `offset` from its center,
 *  looking straight at it. */
function planetPose(id: keyof typeof SOLAR_LAYOUT, offset: Vec3): CameraPose {
  const { position } = SOLAR_LAYOUT[id];
  return { position: addVec3(position, offset), lookAt: position };
}

// Hero gets the closest offset (biggest planet, camera lingers), the
// three main planets a slightly wider, consistent offset so their
// apparent on-screen size stays comparable across the flyby.
const HERO_POSE = planetPose("systems", [5, 2.2, 7]);
const BACKEND_POSE = planetPose("backend", [4, 1.8, 6]);
const DATABASES_POSE = planetPose("databases", [4, 1.6, 6.5]);
const AI_RAG_POSE = planetPose("ai-rag", [4.5, 2, 7]);

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
  // ORBIT VISTA (local 1.0 = end of Launch = start of Solar): wide
  // pull-back — the planet owns the frame, the rocket a coasting speck
  // upper-left after MECO. Also the establishing shot for Solar: the
  // camera glides from here straight into the hero push-in below.
  {
    t: L,
    value: { position: [5.6, 6.9, 10.6], lookAt: [0.4, 4.35, 0] },
  },
  // HERO PUSH-IN (solar-local 0.15): close on the systems-programming
  // planet, the largest and first in visit order.
  { t: solarT(0.15), value: HERO_POSE, ease: easeInOutCubic },
  // HERO LINGER (solar-local 0.38): identical pose held — a hold-via-
  // duplicate-value segment, same technique as the Launch/Solar handoff
  // above. Gives the hero the longest dwell per content.md.
  { t: solarT(0.38), value: HERO_POSE },
  // BACKEND (solar-local 0.55).
  { t: solarT(0.55), value: BACKEND_POSE, ease: easeInOutCubic },
  // DATABASES (solar-local 0.68).
  { t: solarT(0.68), value: DATABASES_POSE, ease: easeInOutCubic },
  // AI / RAG approach → arrival (solar-local 0.82 → 1.0 = end of Solar):
  // final planet in visit order, camera settles here.
  { t: solarT(0.82), value: AI_RAG_POSE, ease: easeInOutCubic },
  { t: solarT(1.0), value: AI_RAG_POSE },
  // Hold the ai/rag shot for the rest of the scroll until the Stations
  // chapter (Phase 4) claims it — same freeze pattern used above.
  { t: 1, value: AI_RAG_POSE },
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
