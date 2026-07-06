"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MILESTONES } from "@/content/milestones";
import { chapterProgress } from "@/lib/chapters";
import { CONSTELLATION_LAYOUT } from "@/lib/constellationLayout";
import { lineReveal } from "@/lib/constellationTimeline";
import { useScrollStore } from "@/stores/scrollStore";
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
 * The polyline REVEALS progressively (roadmap: "stars connect per
 * milestone"): constellationTimeline.ts's lineReveal() gives a continuous
 * tip position in vertex units, and the classic line draw-on technique
 * renders it — setDrawRange() shows only the vertices behind the tip,
 * while ONE moving vertex (the tip itself) is lerped along the current
 * segment each frame, so the line grows smoothly instead of popping a
 * whole segment at a time. All 33 floats are rewritten from the true
 * layout positions every frame before the tip is moved, which is trivially
 * cheap and makes reverse scroll restore earlier states exactly. Driven
 * from refs inside useFrame via getState() — no React re-render per scroll
 * tick, same idiom as every other per-frame consumer.
 *
 * The tip vertex keeps its destination star's vertex COLOR while
 * traveling, so a segment's tier-to-tier color ramp compresses slightly
 * during its reveal — imperceptible at these segment lengths and not worth
 * a second lerp.
 *
 * The text narration overlay is the remaining Phase 5 step — this step
 * only makes illumination/connection progressive.
 */
export function ConstellationChapter() {
  const sorted = useMemo(
    () => [...MILESTONES].sort((a, b) => a.order - b.order),
    []
  );

  const { truePositions, workingPositions, colors } = useMemo(() => {
    const truePositions = new Float32Array(sorted.length * 3);
    const colors = new Float32Array(sorted.length * 3);
    sorted.forEach((m, i) => {
      const [x, y, z] = CONSTELLATION_LAYOUT[m.id];
      truePositions[i * 3] = x;
      truePositions[i * 3 + 1] = y;
      truePositions[i * 3 + 2] = z;
      const tint = new THREE.Color(TIER_TINT[m.tier]);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    });
    // The buffer the GPU sees is a mutable copy; truePositions stays
    // pristine as the restore source each frame.
    return { truePositions, workingPositions: truePositions.slice(), colors };
  }, [sorted]);

  // Group wrapper exists for imperative visibility toggling — R3F's <line>
  // JSX tag collides with the SVG <line> element in TypeScript's eyes, so
  // refs go on its unambiguous group/geometry/attribute neighbors instead.
  const lineGroupRef = useRef<THREE.Group>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positionAttrRef = useRef<THREE.BufferAttribute>(null);

  useFrame(() => {
    const group = lineGroupRef.current;
    const geometry = geometryRef.current;
    const attr = positionAttrRef.current;
    if (!group || !geometry || !attr) return;

    const local = chapterProgress(
      "constellation",
      useScrollStore.getState().progress
    );
    const tip = lineReveal(local);

    group.visible = tip > 0;
    if (!group.visible) return;

    // Tip travels along segment [full, full+1]; vertices before it sit at
    // their true star positions, vertices after it fall outside the draw
    // range. Clamping full to last-1 makes tip = last land the tip vertex
    // exactly on the final star (frac = 1) instead of indexing past it.
    const full = Math.min(Math.floor(tip), sorted.length - 2);
    const frac = tip - full;
    const array = attr.array;
    array.set(truePositions);
    const a = full * 3;
    const b = a + 3;
    for (let c = 0; c < 3; c++) {
      array[b + c] =
        truePositions[a + c] +
        (truePositions[b + c] - truePositions[a + c]) * frac;
    }
    attr.needsUpdate = true;
    geometry.setDrawRange(0, full + 2);
  });

  return (
    <>
      {/* Initially hidden to match progress 0 — useFrame reveals it. */}
      <group ref={lineGroupRef} visible={false}>
        <line>
          <bufferGeometry ref={geometryRef}>
            <bufferAttribute
              ref={positionAttrRef}
              attach="attributes-position"
              args={[workingPositions, 3]}
            />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <lineBasicMaterial vertexColors transparent opacity={0.5} />
        </line>
      </group>
      {sorted.map((m) => (
        <Star
          key={m.id}
          position={CONSTELLATION_LAYOUT[m.id]}
          tier={m.tier}
          order={m.order}
          // Deterministic per-milestone phase so present-tier stars don't
          // pulse in lockstep; harmless no-op for past/future (pulse = 0).
          pulsePhase={m.order * 0.9}
        />
      ))}
    </>
  );
}
