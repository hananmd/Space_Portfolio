"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterProgress } from "@/lib/chapters";
import { createSeededRandom, remapProgress } from "@/lib/math";
import { useScrollStore } from "@/stores/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * ExhaustPlume: the rocket's ignition flame as ONE THREE.Points draw call,
 * animated entirely on the GPU.
 *
 * Each particle is a vertex with baked random attributes (angle, radial
 * fraction, speed, phase, size). The vertex shader derives a looping 0→1
 * "life" via fract(phase + time * speed): born at the nozzle throat,
 * dying at the plume tail, recycled forever — zero per-frame buffer
 * uploads, zero CPU particle bookkeeping.
 *
 * Progress vs. time — a deliberate split of the "everything derives from
 * progress" rule:
 * - STATE derives from progress: uIntensity (0→1 over the ignition ramp
 *   of Launch local progress) gates alpha, plume length and brightness.
 *   Scrolling back un-ignites the engine, perfectly reversibly.
 * - TEXTURE derives from time: the flicker phase. A flame that only moves
 *   while you scroll looks frozen the moment you stop. Reversibility stays
 *   observable where it matters: at progress 0, intensity is 0, the plume
 *   is invisible (and .visible=false skips the draw entirely), so the p=0
 *   frame is pixel-identical every time.
 * - Reduced motion: we stop accumulating time → a static stylized cone,
 *   still scroll-gated.
 */

const PARTICLE_COUNT = 320;
const SEED = 41; // arbitrary but fixed — stable plume across mounts

/**
 * Ignition ramp over Launch LOCAL progress. Placeholder values for step-2
 * review; step 3 (scroll choreography) re-tunes these against the actual
 * pad → ascent timing.
 */
const IGNITION_START = 0.12;
const IGNITION_FULL = 0.3;

const VERTEX = /* glsl */ `
  attribute float aAngle;   // direction around the plume axis
  attribute float aRadial;  // 0 = white-hot core, 1 = plume edge
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;

  uniform float uTime;
  uniform float uIntensity;

  varying float vLife;
  varying float vRadial;

  void main() {
    // Looping lifecycle on the GPU: fract() recycles each particle the
    // frame after it dies. No CPU involvement, no allocations.
    float life = fract(aPhase + uTime * aSpeed);
    vLife = life;
    vRadial = aRadial;

    // Ignition ramp: a short sputter grows into the full exhaust tail.
    float plumeLen = mix(0.3, 1.7, uIntensity);

    // Cone: tight at the throat, widening quadratically downstream.
    float spread = (0.05 + life * life * 0.38) * aRadial;
    // Small time-based sideways wobble sells turbulence; scaled by life so
    // the throat stays pinned to the nozzle.
    float wobble = sin(uTime * 9.0 + aPhase * 47.0) * 0.015 * life;

    vec3 p = vec3(
      cos(aAngle) * spread + wobble,
      -life * plumeLen,
      sin(aAngle) * spread - wobble
    );

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    // Particles swell as they age; the whole plume shrinks at low throttle.
    float size = aSize * (1.0 + life * 1.6) * mix(0.4, 1.0, uIntensity);
    // Same perspective-attenuation trick as the starfield; constant tuned
    // for the plume's much closer camera distance.
    gl_PointSize = size * (240.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uIntensity;

  varying float vLife;
  varying float vRadial;

  void main() {
    // Round the square point sprite into a soft disc.
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.05, d);
    if (disc < 0.01) discard;

    // Temperature ramp along the particle's life:
    // white-hot at the throat → orange mid-plume → dying ember red.
    vec3 core = vec3(1.0, 0.96, 0.88);
    vec3 mid  = vec3(1.0, 0.58, 0.22);
    vec3 tail = vec3(0.65, 0.22, 0.12);
    vec3 col = mix(core, mid, smoothstep(0.0, 0.45, vLife));
    col = mix(col, tail, smoothstep(0.45, 1.0, vLife));
    // Edge particles run cooler/darker than the core.
    col *= 1.0 - 0.35 * vRadial;

    float fade = pow(1.0 - vLife, 1.4);
    float alpha = disc * fade * uIntensity;
    gl_FragColor = vec4(col * (0.7 + 0.6 * uIntensity), alpha);
  }
`;

function buildPlumeAttributes() {
  const rand = createSeededRandom(SEED);
  const positions = new Float32Array(PARTICLE_COUNT * 3); // unused by the
  // shader (position is derived from attributes) but Points requires one.
  const angles = new Float32Array(PARTICLE_COUNT);
  const radials = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    angles[i] = rand() * Math.PI * 2;
    // Squaring biases particles toward the core so the center reads
    // white-hot instead of hollow.
    radials[i] = rand() ** 2;
    speeds[i] = 0.7 + rand() * 0.6;
    phases[i] = rand();
    sizes[i] = 0.25 + rand() * 0.45;
  }

  return { positions, angles, radials, speeds, phases, sizes };
}

export function ExhaustPlume() {
  const reducedMotion = useReducedMotion();
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const attrs = useMemo(buildPlumeAttributes, []);
  // Initial values only. R3F copies this object's ENTRIES into the
  // material's own uniforms on mount, so mutating this memo after mount
  // updates a dead reference — per-frame writes must go through
  // materialRef (found the hard way: a plume frozen at intensity 0).
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat || !pointsRef.current) return;
    // getState() in useFrame — per-frame read, zero React re-renders.
    const local = chapterProgress("launch", useScrollStore.getState().progress);
    const intensity = remapProgress(IGNITION_START, IGNITION_FULL, local);
    mat.uniforms.uIntensity.value = intensity;
    if (!reducedMotion) {
      mat.uniforms.uTime.value += delta;
    }
    // Skip the draw call entirely before ignition.
    pointsRef.current.visible = intensity > 0.001;
  });

  return (
    <points ref={pointsRef} frustumCulled={false /* verts move in-shader */}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.positions, 3]} />
        <bufferAttribute attach="attributes-aAngle" args={[attrs.angles, 1]} />
        <bufferAttribute attach="attributes-aRadial" args={[attrs.radials, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[attrs.speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[attrs.phases, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[attrs.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
