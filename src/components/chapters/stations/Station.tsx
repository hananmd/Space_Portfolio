"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterProgress } from "@/lib/chapters";
import type { StationVisual } from "@/lib/stationLayout";
import { useScrollStore } from "@/stores/scrollStore";

/**
 * One project station: a stylized modular satellite — metallic cylinder
 * core, two flat solar-panel wings, an amber docking ring on the front
 * face. Deliberately industrial/metallic vs. the Solar chapter's matte
 * planet spheres, so Stations reads as a different register: built
 * things, not celestial bodies.
 *
 * Tumbles slowly from Stations-chapter local progress — same reversible
 * self-rotation idiom as Planet.tsx, so scrolling back retraces the exact
 * same orientation instead of drifting from a time-based animation.
 */
export function Station({ visual }: { visual: StationVisual }) {
  const spinRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const local = chapterProgress("stations", useScrollStore.getState().progress);
    if (spinRef.current) {
      spinRef.current.rotation.y =
        visual.spinPhase + local * visual.rotationTurns * Math.PI * 2;
    }
  });

  return (
    <group position={visual.position} scale={visual.scale}>
      <group ref={spinRef}>
        {/* Core module */}
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 3.2, 24]} />
          <meshStandardMaterial color="#8a8f98" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Solar panel wings */}
        <mesh position={[2.6, 0, 0]}>
          <boxGeometry args={[3.2, 1.6, 0.06]} />
          <meshStandardMaterial color="#12141c" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[-2.6, 0, 0]}>
          <boxGeometry args={[3.2, 1.6, 0.06]} />
          <meshStandardMaterial color="#12141c" metalness={0.2} roughness={0.6} />
        </mesh>
        {/* Docking ring, front (+Z) face */}
        <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.08, 16, 32]} />
          <meshStandardMaterial
            color="#c97a4a"
            emissive="#c97a4a"
            emissiveIntensity={0.6}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
