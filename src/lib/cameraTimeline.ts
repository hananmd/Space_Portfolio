import { MILESTONES, type MilestoneTier } from "@/content/milestones";
import { CHAPTERS } from "./chapters";
import { CONSTELLATION_LAYOUT } from "./constellationLayout";
import {
  addVec3,
  lerpVec3,
  sampleKeyframes,
  type Keyframe,
  type Vec3,
} from "./keyframes";
import { SOLAR_LAYOUT } from "./solarLayout";
import { STATION_LAYOUT } from "./stationLayout";
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
 *
 * Chapter 3 "Stations" choreography (keyframe times authored as fractions
 * of the stations range, same convention): the camera glides out of the
 * Solar end-hold into a docking flyby past the 3 project stations in dock
 * order (content.md: Incident Copilot → Maze → OS Scheduler). All 3 share
 * ONE camera offset — stationLayout.ts already decided the stations share
 * one scale, so a per-station offset here would invent a size hierarchy
 * content.md never specifies. What does vary is dwell: Incident Copilot
 * "docks first, most detailed panel" per content.md, so it gets a held
 * linger (same hold-via-duplicate-value technique as the Solar hero),
 * while Maze and OS Scheduler are a flyby. Framing targets each station's
 * CENTER position, not its docking-ring face — Station.tsx tumbles each
 * station around Y from Stations-local progress, so a shot that assumed a
 * fixed ring-facing angle would drift out of frame as the station spins;
 * the same reasoning already applies to planets' self-spin in Solar.
 *
 * Chapter 4 "Constellation" choreography (keyframe times authored as
 * fractions of the constellation range, same convention): unlike planets
 * and stations — individual shot subjects the camera visits nose-to-tail —
 * a constellation's subject is the PATTERN, and each star is a 0.32-radius
 * speck that can't carry a close-up. So the camera frames CLUSTERS via
 * their centroids: glide out of the OS Scheduler hold into the past
 * cluster (where the chronology begins), traverse outward to the present
 * cluster, then pull back and up into a wide reveal where all 11 stars and
 * their connecting line read as one shape — the reveal gets the longest
 * dwell (it's the shot the narration overlay will later live over).
 * Cluster membership is derived from MILESTONES' tier field (content.md's
 * single source of truth) rather than a hand-typed id list, so the shots
 * can never drift from the content data. The FUTURE cluster deliberately
 * gets no close-up beat: constellationLayout.ts placed those stars
 * furthest out to say "not yet reached," and flying the camera to them
 * would contradict that — they're only ever seen from the wide reveal.
 * Same class of judgment call as the exploring planets getting no stop.
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

/** Stations chapter range in global progress — camera beats scale with it. */
const STATIONS_START = CHAPTERS.stations.start;
const STATIONS_SPAN = CHAPTERS.stations.end - CHAPTERS.stations.start;

/** Stations-local fraction f → global progress. */
function stationsT(f: number): number {
  return STATIONS_START + f * STATIONS_SPAN;
}

/** A pose framing a station: pulled back by `offset` from its center,
 *  looking straight at it — same technique as planetPose. */
function stationPose(
  id: keyof typeof STATION_LAYOUT,
  offset: Vec3
): CameraPose {
  const { position } = STATION_LAYOUT[id];
  return { position: addVec3(position, offset), lookAt: position };
}

// One offset for all 3 stations — they share a scale, so they share a
// shot size too (see the module doc comment above).
const STATION_OFFSET: Vec3 = [7, 3.4, 10];
const INCIDENT_COPILOT_POSE = stationPose("incident-copilot", STATION_OFFSET);
const MAZE_POSE = stationPose("maze", STATION_OFFSET);
const OS_SCHEDULER_POSE = stationPose("os-scheduler", STATION_OFFSET);

/** Constellation chapter range in global progress — camera beats scale
 *  with it. */
const CONSTELLATION_START = CHAPTERS.constellation.start;
const CONSTELLATION_SPAN =
  CHAPTERS.constellation.end - CHAPTERS.constellation.start;

/** Constellation-local fraction f → global progress. */
function constellationT(f: number): number {
  return CONSTELLATION_START + f * CONSTELLATION_SPAN;
}

/** Centroid of a set of milestone stars' world positions — the camera
 *  frames star CLUSTERS, not individual stars (see module doc above). */
function starsCentroid(ids: readonly string[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const id of ids) {
    const [px, py, pz] = CONSTELLATION_LAYOUT[id];
    x += px;
    y += py;
    z += pz;
  }
  return [x / ids.length, y / ids.length, z / ids.length];
}

/** Milestone ids belonging to one tier, straight from content data. */
function tierIds(tier: MilestoneTier): string[] {
  return MILESTONES.filter((m) => m.tier === tier).map((m) => m.id);
}

/** A pose framing a star cluster: pulled back by `offset` from its
 *  centroid, looking straight at it — same technique as planetPose /
 *  stationPose, just aimed at a derived center instead of one object. */
function clusterPose(center: Vec3, offset: Vec3): CameraPose {
  return { position: addVec3(center, offset), lookAt: center };
}

// Offsets keep the camera on the NEAR side of the outward arc (-x/+z of
// the clusters), consistent with arriving from the OS Scheduler station —
// crossing to the far side would flip the constellation left-to-right
// between shots and break the "traveling outward" read.
const PAST_CLUSTER_POSE = clusterPose(starsCentroid(tierIds("past")), [
  -10, 2.5, 15,
]);
const PRESENT_CLUSTER_POSE = clusterPose(starsCentroid(tierIds("present")), [
  -8, 2, 13,
]);
// Wide reveal: raised well above the clusters' y (2–8) so the pattern is
// seen slightly from above, separating the three depth bands on screen.
const CONSTELLATION_WIDE_POSE = clusterPose(
  starsCentroid(MILESTONES.map((m) => m.id)),
  [-15, 9, 35]
);

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
  // DOCKING APPROACH (stations-local 0.08): glide out of the ai/rag hold
  // into the first station, docked first per content.md.
  { t: stationsT(0.08), value: INCIDENT_COPILOT_POSE, ease: easeInOutCubic },
  // INCIDENT COPILOT LINGER (stations-local 0.30): held pose (hold-via-
  // duplicate-value, same technique as the Solar hero linger) — content.md
  // calls this station's panel "most detailed", so it gets the longest
  // dwell of the 3.
  { t: stationsT(0.3), value: INCIDENT_COPILOT_POSE },
  // MAZE (stations-local 0.55).
  { t: stationsT(0.55), value: MAZE_POSE, ease: easeInOutCubic },
  // OS SCHEDULER approach → arrival (stations-local 0.8 → 1.0 = end of
  // Stations): last station in dock order, camera settles here.
  { t: stationsT(0.8), value: OS_SCHEDULER_POSE, ease: easeInOutCubic },
  { t: stationsT(1.0), value: OS_SCHEDULER_POSE },
  // PAST CLUSTER (constellation-local 0.12): glide out of the OS Scheduler
  // hold into the six bright past stars — the chronological start of the
  // constellation.
  { t: constellationT(0.12), value: PAST_CLUSTER_POSE, ease: easeInOutCubic },
  // PRESENT CLUSTER (constellation-local 0.42): traverse outward along the
  // timeline to the three softly-pulsing present stars.
  {
    t: constellationT(0.42),
    value: PRESENT_CLUSTER_POSE,
    ease: easeInOutCubic,
  },
  // WIDE REVEAL (constellation-local 0.72 → 1.0 = end of Constellation):
  // pull back and up until all 11 stars + connecting line read as one
  // shape. Longest dwell of the chapter (hold-via-duplicate-value) — this
  // is the shot the milestone narration will later live over. The future
  // cluster is only ever seen from here, never visited (see module doc).
  {
    t: constellationT(0.72),
    value: CONSTELLATION_WIDE_POSE,
    ease: easeInOutCubic,
  },
  { t: constellationT(1.0), value: CONSTELLATION_WIDE_POSE },
  // Hold the wide reveal for the rest of the scroll until the Finale
  // chapter (Phase 6) claims it — same freeze pattern as every prior
  // chapter boundary.
  { t: 1, value: CONSTELLATION_WIDE_POSE },
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
