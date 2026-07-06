"use client";

import { PROJECT_STATIONS } from "@/content/projects";
import { STATION_LAYOUT } from "@/lib/stationLayout";
import { Station } from "./Station";

/**
 * Chapter 3 — Stations / projects. Composes the 3 v1 project stations from
 * content + layout data, mirroring SolarChapter's content/layout split.
 * Docking camera move and the holographic UI panel (GitHub / demo / stack)
 * are later Phase 4 steps — this step only places the station objects in
 * world space.
 */
export function StationsChapter() {
  return (
    <>
      {PROJECT_STATIONS.map((project) => (
        <Station key={project.id} visual={STATION_LAYOUT[project.id]} />
      ))}
    </>
  );
}
