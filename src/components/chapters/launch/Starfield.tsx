"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { createSeededRandom } from "@/lib/math";

/**
 * Starfield: every star lives in ONE THREE.Points object — one position
 * buffer, one draw call — instead of thousands of meshes.
 *
 * Positions are sampled on a thick spherical shell around the scene so
 * the camera can fly anywhere inside Chapter 1 and remain surrounded.
 * The seeded PRNG makes the sky identical on every mount (no re-shuffle
 * on hot reload, no SSR/client mismatch).
 *
 * A minimal point shader does two jobs the default PointsMaterial can't:
 * rounds the square gl_Point into a soft disc, and varies size/tint per
 * star (attributes) with distance attenuation.
 */

const STAR_COUNT = 2500;
/** Shell radii — inside the camera far plane (200) with margin. */
const SHELL_MIN = 60;
const SHELL_MAX = 110;
const SEED = 20260706; // arbitrary but fixed

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Perspective attenuation: nearer stars render larger. The constant
    // scales world units to pixels and was tuned by eye.
    gl_PointSize = aSize * (260.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // gl_PointCoord is 0→1 across the point sprite; fade by distance from
    // its center to turn the default square into a soft round star.
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, d);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/** Subtle stellar temperature palette: white, blue-white, warm. */
const STAR_TINTS = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#cfe0ff"),
  new THREE.Color("#ffe9c9"),
] as const;

function buildStarAttributes() {
  const rand = createSeededRandom(SEED);
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const colors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Uniform direction on a sphere: z uniform in [-1,1], angle uniform in
    // [0,2π). Naive random angles would clump stars at the poles.
    const z = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const xy = Math.sqrt(1 - z * z);
    const r = SHELL_MIN + rand() * (SHELL_MAX - SHELL_MIN);

    positions[i * 3] = xy * Math.cos(theta) * r;
    positions[i * 3 + 1] = xy * Math.sin(theta) * r;
    positions[i * 3 + 2] = z * r;

    // Squaring biases toward small stars — a few bright ones read as
    // "night sky", uniformly big ones read as "confetti".
    const s = rand();
    sizes[i] = 0.6 + s * s * 2.2;

    const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
    // Dim tied to size so big stars are also the bright ones.
    const brightness = 0.5 + s * 0.5;
    colors[i * 3] = tint.r * brightness;
    colors[i * 3 + 1] = tint.g * brightness;
    colors[i * 3 + 2] = tint.b * brightness;
  }

  return { positions, sizes, colors };
}

export function Starfield() {
  const { positions, sizes, colors } = useMemo(buildStarAttributes, []);

  return (
    <points frustumCulled={false /* shell surrounds the camera; skip the cull test */}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
