"use client";

import { SKILL_PLANETS } from "@/content/skills";
import { SOLAR_LAYOUT } from "@/lib/solarLayout";
import { Planet } from "./Planet";
import { PlanetLabel } from "./PlanetLabel";

/**
 * Chapter 2 — Solar system / skills. Composes the 6 skill planets from
 * content + layout data. Each Planet self-gates its spin off Solar-chapter
 * local progress, same pattern as LaunchChapter; each PlanetLabel is a
 * screen-space name tag anchored to the same world position. Camera
 * choreography (step 2) now flies through all 6 in visit order.
 */
export function SolarChapter() {
  return (
    <>
      {SKILL_PLANETS.map((planet) => (
        <group key={planet.id}>
          <Planet visual={SOLAR_LAYOUT[planet.id]} />
          <PlanetLabel
            visual={SOLAR_LAYOUT[planet.id]}
            name={planet.name}
            kind={planet.kind}
          />
        </group>
      ))}
    </>
  );
}
