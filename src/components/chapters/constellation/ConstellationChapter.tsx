"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MILESTONES } from "@/content/milestones";
import { CONSTELLATION_LAYOUT } from "@/lib/constellationLayout";
import { Star } from "./Star";

/** Tier tint, mirrored from Star.tsx's TIER_STYLE (line color only — the
 *  connecting line doesn't need the pulse/bloom-intensity story a star's
 *  material does, just a matching hue). */
const TIER_TINT: Readonly<Record<string, string>> = {
  past: "#ffe9c9",
  present: "#8fd0dd",
  future: "#5a6272",
};

/**
 * Chapter 4 — Constellation / milestones. Composes the 11 milestone stars
 * from content + layout data (mirrors SolarChapter/StationsChapter's
 * content/layout split), plus one connecting polyline drawn through them
 * in chronological order — the literal "connect the dots" of a
 * constellation.
 *
 * Camera choreography through the constellation and the text narration
 * overlay are later Phase 5 steps — this step only places the stars and
 * their connections in world space, same as Solar/Stations step 1.
 */
export function ConstellationChapter() {
  const sorted = useMemo(
    () => [...MILESTONES].sort((a, b) => a.order - b.order),
    []
  );

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(sorted.length * 3);
    const colors = new Float32Array(sorted.length * 3);
    sorted.forEach((m, i) => {
      const [x, y, z] = CONSTELLATION_LAYOUT[m.id];
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const tint = new THREE.Color(TIER_TINT[m.tier]);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    });
    return { positions, colors };
  }, [sorted]);

  return (
    <>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.5} />
      </line>
      {sorted.map((m) => (
        <Star
          key={m.id}
          position={CONSTELLATION_LAYOUT[m.id]}
          tier={m.tier}
          // Deterministic per-milestone phase so present-tier stars don't
          // pulse in lockstep; harmless no-op for past/future (pulse = 0).
          pulsePhase={m.order * 0.9}
        />
      ))}
    </>
  );
}
