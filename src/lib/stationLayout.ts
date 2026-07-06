import type { Vec3 } from "./keyframes";

/**
 * Stations chapter art direction: world position, scale and self-rotation
 * per station. Kept separate from content/projects.ts for the same reason
 * solarLayout.ts stays separate from content/skills.ts — content.md decides
 * WHAT each station represents, never WHERE it sits or how big it is.
 *
 * Layout: continues the Solar chapter's receding arc (Earth at the origin
 * → systems → backend → databases → ai-rag, ending at [30, 3.0, -41]) with
 * the same per-step direction, so Stations reads as the next leg of one
 * continuous outward journey rather than a disconnected new area. A later
 * docking camera timeline (Phase 4, next step) will read positions from
 * here directly, same pattern cameraTimeline.ts already uses for planets.
 *
 * All 3 stations share one scale — content.md gives stations a dock ORDER
 * and panel-detail differences, but never a size hierarchy the way it
 * explicitly calls the systems planet "HERO, largest"; inventing one here
 * would be a speculative feature.
 */

export interface StationVisual {
  position: Vec3;
  scale: number;
  /** Full local-progress traversal turns this station — desynced per
   *  station via a phase offset, same idiom as PlanetVisual. */
  rotationTurns: number;
  spinPhase: number;
}

export const STATION_LAYOUT: Readonly<Record<string, StationVisual>> = {
  "incident-copilot": {
    position: [37, 2.4, -53],
    scale: 1,
    rotationTurns: 0.2,
    spinPhase: 0,
  },
  maze: {
    position: [44, 1.8, -65],
    scale: 1,
    rotationTurns: 0.2,
    spinPhase: 0.55,
  },
  "os-scheduler": {
    position: [51, 1.2, -77],
    scale: 1,
    rotationTurns: 0.2,
    spinPhase: 1.1,
  },
} as const;
