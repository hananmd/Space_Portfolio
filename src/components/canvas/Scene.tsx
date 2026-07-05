"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./CameraRig";
import { LaunchChapter } from "@/components/chapters/launch/LaunchChapter";

/**
 * Scene shell: canvas config, lighting, camera rig, chapters.
 *
 * Lighting is deliberately a single "sun" — one dominant directional
 * light plus a whisper of ambient fill. Real space has one light source;
 * this asymmetry (lit limb vs. terminator falling into black) is most of
 * what makes the render read as NASA photography instead of a game menu.
 *
 * Suspense: Earth's texture loads via drei useTexture (suspends). The
 * null fallback means stars/black render instantly and the planet pops in
 * when its 500KB texture arrives — acceptable for the prototype.
 */
export function Scene() {
  return (
    <Canvas
      // dpr capped at 2: retina sharpness without paying 3x fill rate.
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 200, position: [0, 2, 14] }}
      style={{ position: "fixed", inset: 0 }}
      aria-hidden // decorative; all meaning lives in the DOM overlay layer
    >
      <color attach="background" args={["#000000"]} />
      {/* Sun: upper-right-front — lights the hemisphere facing the camera
          while the terminator falls across the left limb. */}
      <directionalLight position={[6, 3, 10]} intensity={2.2} />
      {/* Faint fill so the night side is near-black, not information-free. */}
      <ambientLight intensity={0.06} />
      <Suspense fallback={null}>
        <LaunchChapter />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
