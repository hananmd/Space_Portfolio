"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ExhaustPlume } from "./ExhaustPlume";

/**
 * Rocket: stylized model built from primitives — no GLTF download, no
 * licensing, and every dimension is a tunable number.
 *
 * The fuselage is ONE LatheGeometry: a 2D profile (radius, height) pairs
 * revolved around Y. That gives a seamless silhouette from flat base to
 * rounded nose — a stacked cylinder+cone would show a hard crease where
 * they meet. Fins are a 2D Shape extruded to a thin slab; each fin's
 * plane contains the rocket axis, so rotating a parent group 120° apart
 * sweeps three of them evenly around the hull.
 *
 * Local space contract (choreography relies on this):
 * - Origin (y=0) is the fuselage base sitting on the "pad".
 * - +Y is up. Nose tip ≈ y=1.86, nozzle exit ≈ y=-0.3.
 * - The exhaust plume is parented at the nozzle exit, so moving/rotating
 *   this group moves the flame with it for free.
 */

/** Fuselage profile: (radius, height) pairs, base → nose tip. */
const HULL_PROFILE: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.24, 0],
  [0.3, 0.12],
  [0.3, 1.0],
  [0.26, 1.3],
  [0.17, 1.55],
  [0.06, 1.78],
  [0, 1.86],
];

const FIN_COUNT = 3;
/** Fins embed slightly into the hull (radius 0.3) so no gap shows. */
const FIN_INSET_X = 0.27;

export function Rocket() {
  const hullPoints = useMemo(
    () => HULL_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  // Fin outline in its own plane: x = radially outward, y = up. Swept-back
  // trapezoid whose tip drops below the base — the classic "standing on
  // its fins" stance.
  const finShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.65); // top leading edge, against the hull
    s.lineTo(0, -0.02); // down the hull to just below the base
    s.lineTo(0.38, -0.16); // out to the ground-touching tip
    s.lineTo(0.3, 0.15); // trailing edge back up
    s.closePath();
    return s;
  }, []);

  const finExtrude = useMemo(
    () =>
      ({
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      }) satisfies THREE.ExtrudeGeometryOptions,
    []
  );

  return (
    <group>
      {/* Fuselage — one seamless lathe. */}
      <mesh>
        <latheGeometry args={[hullPoints, 48]} />
        <meshStandardMaterial color="#e8e6e1" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Graphic break band where the nose taper begins — the NASA-style
          paint line that keeps a plain white hull from reading as untextured. */}
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[0.303, 0.303, 0.07, 48]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Porthole: torus rim + glass disc, tilted to sit flush against the
          nose taper. Faces +Z — the rocket's "front". */}
      <group position={[0, 1.12, 0.27]} rotation={[-0.12, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.085, 0.022, 12, 32]} />
          <meshStandardMaterial color="#2e2e33" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial color="#10233f" roughness={0.15} metalness={0.3} />
        </mesh>
      </group>

      {/* Fins: same geometry three times, swept around Y. */}
      {Array.from({ length: FIN_COUNT }, (_, i) => (
        <group key={i} rotation={[0, (i / FIN_COUNT) * Math.PI * 2 - 0.4, 0]}>
          {/* z offset centers the extrusion depth on the fin plane. */}
          <mesh position={[FIN_INSET_X, 0, -finExtrude.depth / 2]}>
            <extrudeGeometry args={[finShape, finExtrude]} />
            <meshStandardMaterial color="#a63d2f" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Engine nozzle: dark metallic bell below the base. */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.24, 0.3, 32]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Ignition exhaust, anchored at the nozzle exit plane. */}
      <group position={[0, -0.3, 0]}>
        <ExhaustPlume />
      </group>
    </group>
  );
}
