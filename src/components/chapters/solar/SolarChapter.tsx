"use client";

import { SKILL_PLANETS } from "@/content/skills";
import { SOLAR_LAYOUT } from "@/lib/solarLayout";
import { Planet } from "./Planet";

/**
 * Chapter 2 — Solar system / skills. Step 1: static planet field only.
 * Composes the 6 skill planets from content + layout data; each Planet
 * self-gates its spin off Solar-chapter local progress, same pattern as
 * LaunchChapter. Camera choreography and floating labels are later steps
 * (roadmap.md Phase 3) — the camera timeline still holds its Launch-end
 * vista pose through this entire range, so full framing isn't in yet.
 */
export function SolarChapter() {
  return (
    <>
      {SKILL_PLANETS.map((planet) => (
        <Planet key={planet.id} visual={SOLAR_LAYOUT[planet.id]} />
      ))}
    </>
  );
}
