import type { Vec3 } from "./keyframes";

/**
 * Constellation chapter art direction: one world position per milestone.
 * Kept separate from content/milestones.ts for the same reason
 * solarLayout.ts/stationLayout.ts stay separate from their content files —
 * content.md decides WHAT each milestone is and its past/present/future
 * tier, never WHERE it sits in space.
 *
 * Layout: continues the outward arc established by Solar and Stations
 * (Earth at the origin → planets → stations, last station "os-scheduler"
 * at [51, 1.2, -77]) rather than starting a disconnected new region — same
 * reasoning stationLayout.ts already used against solarLayout.ts. Unlike
 * the planets/stations (a single-file train of stops), the 11 points are
 * spread into an actual constellation shape (varied x/y scatter, not one
 * line) since these are meant to be connected by lines into a recognizable
 * pattern, not visited one at a time nose-to-tail.
 *
 * Depth is also used to carry meaning: past-tier milestones sit nearest
 * the last station, present-tier further out, future-tier furthest —
 * spatially reinforcing "the future hasn't been reached yet." This is a
 * judgment call (content.md gives brightness tiers, not a spatial rule),
 * flagged same as the "no invented size hierarchy" call below.
 *
 * All 11 stars share ONE radius (see Star.tsx) — content.md gives past/
 * present/future BRIGHTNESS, never a size hierarchy the way it calls the
 * systems planet "HERO, largest"; inventing one here would be the same
 * kind of speculative feature stationLayout.ts already declined to add.
 */

export const CONSTELLATION_LAYOUT: Readonly<Record<string, Vec3>> = {
  // PAST — nearest cluster.
  "started-cs": [58, 4.5, -85],
  maze: [63, 6.0, -90],
  "blog-launch": [68, 3.0, -84],
  "os-scheduler": [66, 7.5, -96],
  "opsidian-hackathon": [73, 5.0, -100],
  "students-union": [70, 2.0, -106],
  // PRESENT — mid cluster.
  "incident-copilot": [78, 6.5, -104],
  "dsa-practice": [76, 3.5, -112],
  "system-design-deepening": [83, 5.5, -110],
  // FUTURE — furthest cluster, not yet reached.
  "first-internship": [81, 8.0, -118],
  "graduate-ucsc": [88, 6.0, -122],
} as const;
