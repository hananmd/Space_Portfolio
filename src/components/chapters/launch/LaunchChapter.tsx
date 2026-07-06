"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterProgress } from "@/lib/chapters";
import {
  ROCKET_SCALE,
  sampleFlameIntensity,
  sampleRocketPose,
} from "@/lib/launchTimeline";
import { useScrollStore } from "@/stores/scrollStore";
import { Earth } from "./Earth";
import { Rocket } from "./Rocket";
import { Starfield } from "./Starfield";

/**
 * Chapter 1 — Launch. Composes the chapter's world and plays the launch
 * choreography: every frame the rocket's pose and the flame light are
 * sampled from data tracks in lib/launchTimeline.ts using chapter-local
 * progress. Same pattern as the camera rig — getState() inside useFrame,
 * zero React re-renders, mutate refs only.
 */
export function LaunchChapter() {
  const rocketRef = useRef<THREE.Group>(null);
  const flameLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const local = chapterProgress("launch", useScrollStore.getState().progress);

    if (rocketRef.current) {
      const pose = sampleRocketPose(local);
      rocketRef.current.position.set(...pose.position);
      // Gravity-turn lean; group origin is the rocket base, so it pivots
      // about its tail like a real pitch-over, not about its center.
      rocketRef.current.rotation.z = pose.tiltZ;
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = sampleFlameIntensity(local);
    }
  });

  return (
    <>
      <Starfield />
      <Earth />
      <group ref={rocketRef} scale={ROCKET_SCALE}>
        <Rocket />
        {/* Lighting keyframe track: warm engine glow at the nozzle. Lights
            the hull and the pad below at ignition; intensity is data-driven
            (launchTimeline FLAME_LIGHT), 0 before ignition. */}
        <pointLight
          ref={flameLightRef}
          position={[0, -0.45, 0]}
          color="#ff9a4a"
          intensity={0}
          distance={9}
          decay={2}
        />
      </group>
    </>
  );
}
