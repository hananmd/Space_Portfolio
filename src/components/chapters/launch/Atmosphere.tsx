"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Atmosphere: a slightly larger sphere rendered inside-out (BackSide)
 * with a fresnel glow shader.
 *
 * The fresnel term is dot(viewDir, normal) in view space. On the visible
 * back faces that dot is ≈ -1 at the disc center and → 0 at the
 * silhouette, so (1 + dot) peaks exactly at the rim — the thin blue limb
 * you see in orbital photography — and works from every camera angle
 * because it is recomputed per fragment against the current view.
 *
 * Additive blending + depthWrite:false make it pure emitted light: it
 * brightens what is behind it (stars, the planet edge) without ever
 * occluding anything.
 */

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    // View-space camera sits at the origin, so direction to camera is
    // simply the negated fragment position.
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Back-face normals point away from the camera: dot ∈ [-1, 0].
    // 1 + dot remaps that to [0, 1] with the maximum at the silhouette.
    float rim = clamp(1.0 + dot(normalize(vViewDir), normalize(vNormal)), 0.0, 1.0);
    float glow = pow(rim, uPower) * uIntensity;
    gl_FragColor = vec4(uColor * glow, glow);
  }
`;

interface AtmosphereProps {
  /** Radius of the planet this halo wraps. */
  radius: number;
}

/** Halo shell is 8% larger than the planet — the visible glow thickness. */
const SHELL_SCALE = 1.08;

export function Atmosphere({ radius }: AtmosphereProps) {
  // Uniforms are memoized once; the material itself is declared in JSX so
  // R3F disposes it (and the geometry) automatically on unmount.
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#4d8fd1") },
      uPower: { value: 3.5 },
      uIntensity: { value: 1.4 },
    }),
    []
  );

  return (
    <mesh scale={SHELL_SCALE}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
