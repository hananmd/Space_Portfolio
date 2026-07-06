import type { Vec3 } from "./keyframes";

/**
 * Solar chapter art direction: world position, radius and color per planet.
 *
 * Kept separate from content/skills.ts on purpose — content.md specifies
 * WHAT each planet represents, never WHERE it sits or what it looks like.
 * This file is the single source of truth for planet placement so a later
 * camera timeline (Phase 3 step 2) can read positions from here directly,
 * the same way launchTimeline.ts's throttle envelope is shared between the
 * exhaust plume and the flame light — one number, never duplicated.
 *
 * Layout: a gentle rightward arc receding from Earth (radius 3 at the
 * origin), hero planet closest, main planets in visit order, the two
 * exploring planets pushed off-arc and further out ("small, distant,
 * dimmer" per content.md) so they read as background signal rather than
 * stops on the main path.
 */

export interface PlanetVisual {
  position: Vec3;
  radius: number;
  color: string;
  /** Full local-progress traversal turns this planet — desynced per planet
   *  via a phase offset so all 6 don't spin in lockstep. */
  rotationTurns: number;
  spinPhase: number;
  /** Exploring planets render flat/dim with no atmosphere shell. */
  hasAtmosphere: boolean;
}

export const SOLAR_LAYOUT: Readonly<Record<string, PlanetVisual>> = {
  systems: {
    position: [10, 4.2, -8],
    radius: 2.4,
    color: "#c97a4a",
    rotationTurns: 0.3,
    spinPhase: 0,
    hasAtmosphere: true,
  },
  backend: {
    position: [17, 3.6, -18],
    radius: 1.6,
    color: "#3f8f86",
    rotationTurns: 0.3,
    spinPhase: 0.37,
    hasAtmosphere: true,
  },
  databases: {
    position: [24, 5.4, -29],
    radius: 1.6,
    color: "#5b5fa6",
    rotationTurns: 0.3,
    spinPhase: 0.74,
    hasAtmosphere: true,
  },
  "ai-rag": {
    position: [30, 3.0, -41],
    radius: 1.6,
    color: "#8fd0dd",
    rotationTurns: 0.3,
    spinPhase: 1.11,
    hasAtmosphere: true,
  },
  "system-design": {
    position: [22, 9.5, -34],
    radius: 0.7,
    color: "#5a6272",
    rotationTurns: 0.15,
    spinPhase: 1.48,
    hasAtmosphere: false,
  },
  mlops: {
    position: [36, 1.0, -20],
    radius: 0.7,
    color: "#6b5a72",
    rotationTurns: 0.15,
    spinPhase: 1.85,
    hasAtmosphere: false,
  },
} as const;
