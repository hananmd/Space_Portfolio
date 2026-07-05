"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sampleCameraTimeline } from "@/lib/cameraTimeline";
import { damp } from "@/lib/math";
import { useScrollStore } from "@/stores/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The ONE place that moves the camera.
 *
 * Every frame: read progress (via getState — no React subscription, so no
 * re-render per scroll tick), sample the data-driven timeline for the
 * target pose, then exponentially damp the actual camera toward it.
 * Damping absorbs discrete wheel steps on top of Lenis smoothing; because
 * the pose is a pure function of progress, scrolling back retraces the
 * identical path in reverse.
 */

/** Responsiveness of the camera chase; higher = tighter to the scroll. */
const DAMP_LAMBDA = 6;

export function CameraRig() {
  const reducedMotion = useReducedMotion();

  // Persistent scratch vectors — allocated once, mutated per frame,
  // to avoid GC pressure at 60 FPS.
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, dt) => {
    const progress = useScrollStore.getState().progress;
    const pose = sampleCameraTimeline(progress);

    if (reducedMotion) {
      // Reduced motion: no chase/glide — place the camera exactly at the
      // pose so motion is minimal and directly tied to scroll position.
      camera.position.set(...pose.position);
      currentLookAt.current.set(...pose.lookAt);
    } else {
      // Clamp dt: after a tab switch dt can be huge, which would make
      // damp() overshoot-free but visually "teleport". 1/30s max step.
      const step = Math.min(dt, 1 / 30);
      camera.position.set(
        damp(camera.position.x, pose.position[0], DAMP_LAMBDA, step),
        damp(camera.position.y, pose.position[1], DAMP_LAMBDA, step),
        damp(camera.position.z, pose.position[2], DAMP_LAMBDA, step)
      );
      currentLookAt.current.set(
        damp(currentLookAt.current.x, pose.lookAt[0], DAMP_LAMBDA, step),
        damp(currentLookAt.current.y, pose.lookAt[1], DAMP_LAMBDA, step),
        damp(currentLookAt.current.z, pose.lookAt[2], DAMP_LAMBDA, step)
      );
    }

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
