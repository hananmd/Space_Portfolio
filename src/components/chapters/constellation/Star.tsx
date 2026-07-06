"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MilestoneTier } from "@/content/milestones";
import type { Vec3 } from "@/lib/keyframes";

/**
 * One Constellation milestone: a small emissive sphere. Appearance is
 * driven entirely by `tier` (content.md's past/present/future signal) — see
 * the module doc in constellationLayout.ts for why all 11 share one radius
 * rather than a size hierarchy.
 *
 * Past-tier intensity (1.5) sits above PostProcessing's Bloom threshold
 * (0.9), so past stars glow through the existing pipeline for free — no
 * new effect needed. Present-tier stars get a gentle sine pulse on
 * emissiveIntensity, driven by accumulated clock time (not scroll
 * progress) — same reasoning as ExhaustPlume's flicker: "softly glowing"
 * needs to visibly breathe, and a value frozen between scroll ticks would
 * just read as a static dim dot, indistinguishable from "dim" future stars
 * at a glance.
 */

const RADIUS = 0.32;

const TIER_STYLE: Readonly<
  Record<MilestoneTier, { color: string; base: number; pulse: number }>
> = {
  past: { color: "#ffe9c9", base: 1.5, pulse: 0 },
  present: { color: "#8fd0dd", base: 0.65, pulse: 0.3 },
  future: { color: "#5a6272", base: 0.15, pulse: 0 },
};

export function Star({
  position,
  tier,
  pulsePhase = 0,
}: {
  position: Vec3;
  tier: MilestoneTier;
  /** Desyncs multiple present-tier stars so they don't pulse in lockstep. */
  pulsePhase?: number;
}) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const style = TIER_STYLE[tier];

  useFrame(({ clock }) => {
    if (!materialRef.current || style.pulse === 0) return;
    const wave = Math.sin(clock.elapsedTime * 1.4 + pulsePhase) * 0.5 + 0.5;
    materialRef.current.emissiveIntensity = style.base + wave * style.pulse;
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[RADIUS, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={style.color}
        emissive={style.color}
        emissiveIntensity={style.base}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}
