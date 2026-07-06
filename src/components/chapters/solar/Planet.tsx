"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterProgress } from "@/lib/chapters";
import type { PlanetVisual } from "@/lib/solarLayout";
import { useScrollStore } from "@/stores/scrollStore";
import { Atmosphere } from "../launch/Atmosphere";

/**
 * One skill planet: a flat-shaded sphere (stylized, like the Rocket —
 * there's no real texture for a fictional planet) that self-spins from
 * Solar-chapter local progress, same reversible idiom as Earth's rotation.
 * Hero/main planets get a fresnel rim shell; exploring planets stay flat
 * and dim, no atmosphere, so the visual hierarchy matches content.md's
 * "small, distant, dimmer" framing without needing a caption to explain it.
 */
export function Planet({ visual }: { visual: PlanetVisual }) {
  const spinRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const local = chapterProgress("solar", useScrollStore.getState().progress);
    if (spinRef.current) {
      spinRef.current.rotation.y =
        visual.spinPhase + local * visual.rotationTurns * Math.PI * 2;
    }
  });

  return (
    <group position={visual.position}>
      <group ref={spinRef}>
        <mesh>
          <sphereGeometry args={[visual.radius, 48, 48]} />
          <meshStandardMaterial
            color={visual.color}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
      {visual.hasAtmosphere && (
        <Atmosphere radius={visual.radius} color={visual.color} />
      )}
    </group>
  );
}
