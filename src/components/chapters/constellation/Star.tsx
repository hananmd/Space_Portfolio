"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MilestoneTier } from "@/content/milestones";
import { chapterProgress } from "@/lib/chapters";
import { starIllumination } from "@/lib/constellationTimeline";
import type { Vec3 } from "@/lib/keyframes";
import { useScrollStore } from "@/stores/scrollStore";

/**
 * One Constellation milestone: a small emissive sphere. Appearance is
 * driven entirely by `tier` (content.md's past/present/future signal) — see
 * the module doc in constellationLayout.ts for why all 11 share one radius
 * rather than a size hierarchy.
 *
 * Illumination is progressive (roadmap: "stars illuminate per milestone"):
 * a 0→1 `lit` factor from constellationTimeline.ts, derived from
 * constellation-LOCAL progress and this star's chronological `order`,
 * scales both emissive intensity and opacity — so each star fades in from
 * nothing to its TIER's brightness, in order, as the visitor scrolls. The
 * factor multiplies the tier intensity rather than replacing it: a fully
 * revealed future star is still content.md's dim gray. While unlit the
 * mesh is hidden entirely, skipping the draw call — same idiom as
 * ExhaustPlume before ignition.
 *
 * Past-tier intensity (1.5) sits above PostProcessing's Bloom threshold
 * (0.9), so past stars glow through the existing pipeline for free — no
 * new effect needed. Present-tier stars get a gentle sine pulse on
 * emissiveIntensity, driven by accumulated clock time (not scroll
 * progress) — same reasoning as ExhaustPlume's flicker: "softly glowing"
 * needs to visibly breathe, and a value frozen between scroll ticks would
 * just read as a static dim dot, indistinguishable from "dim" future stars
 * at a glance. The pulse is inside the lit-scaled term, so a half-revealed
 * present star breathes at half amplitude instead of popping to full pulse
 * mid-fade.
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
  order,
  pulsePhase = 0,
}: {
  position: Vec3;
  tier: MilestoneTier;
  /** Chronological milestone order (1-based) — decides WHEN this star
   *  illuminates, via constellationTimeline.ts. */
  order: number;
  /** Desyncs multiple present-tier stars so they don't pulse in lockstep. */
  pulsePhase?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const style = TIER_STYLE[tier];

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const local = chapterProgress(
      "constellation",
      useScrollStore.getState().progress
    );
    const lit = starIllumination(order, local);

    mesh.visible = lit > 0;
    if (!mesh.visible) return;

    const wave =
      style.pulse > 0
        ? (Math.sin(clock.elapsedTime * 1.4 + pulsePhase) * 0.5 + 0.5) *
          style.pulse
        : 0;
    material.emissiveIntensity = lit * (style.base + wave);
    material.opacity = lit;
  });

  // Initial props match progress 0 (unlit, hidden) so the first rendered
  // frame never flashes a fully-lit constellation before useFrame runs.
  return (
    <mesh ref={meshRef} position={position} visible={false}>
      <sphereGeometry args={[RADIUS, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={style.color}
        emissive={style.color}
        emissiveIntensity={0}
        transparent
        opacity={0}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}
