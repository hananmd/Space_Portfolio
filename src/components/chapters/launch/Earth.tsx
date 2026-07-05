"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { chapterProgress } from "@/lib/chapters";
import { useScrollStore } from "@/stores/scrollStore";
import { Atmosphere } from "./Atmosphere";

/**
 * Earth: textured sphere + fresnel atmosphere shell.
 *
 * Texture: NASA Blue Marble (public domain), via the three.js examples
 * repo — /public/textures/earth_day_2048.jpg.
 *
 * Rotation derives from Launch-chapter local progress (never from time or
 * wheel events), so scrolling back rewinds the planet exactly like it
 * rewinds the camera.
 */

export const EARTH_RADIUS = 3;

/** Earth's real axial tilt (23.4°) — sells realism at zero cost. */
const AXIAL_TILT = THREE.MathUtils.degToRad(23.4);

/** Full local progress (0→1 through Launch) turns the planet this far. */
const ROTATION_TURNS = 0.35;

export function Earth() {
  const dayMap = useTexture("/textures/earth_day_2048.jpg", (tex) => {
    // Color textures must be tagged sRGB or lighting math treats them as
    // linear and the planet renders washed out.
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8; // keeps the texture crisp at glancing angles
  });

  const spinRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // getState() in useFrame: per-frame read with zero React re-renders —
    // same pattern as CameraRig.
    const local = chapterProgress("launch", useScrollStore.getState().progress);
    if (spinRef.current) {
      spinRef.current.rotation.y = local * ROTATION_TURNS * Math.PI * 2;
    }
  });

  return (
    // Outer group applies the fixed axial tilt; inner group spins around
    // the tilted axis. Separating them keeps the spin math a single
    // rotation.y instead of a composed quaternion.
    <group rotation={[0, 0, -AXIAL_TILT]}>
      <group ref={spinRef}>
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial map={dayMap} roughness={1} metalness={0} />
        </mesh>
      </group>
      <Atmosphere radius={EARTH_RADIUS} />
    </group>
  );
}
