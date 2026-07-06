"use client";

import { Html } from "@react-three/drei";
import type { PlanetKind } from "@/content/skills";
import type { PlanetVisual } from "@/lib/solarLayout";
import styles from "./PlanetLabel.module.css";

const KIND_CLASS: Record<PlanetKind, string> = {
  hero: styles.hero,
  main: styles.main,
  exploring: styles.exploring,
};

/**
 * A floating name tag anchored just above a planet. Uses drei's <Html>
 * (a real positioned DOM node, reusing the page's existing Geist font)
 * rather than in-scene SDF text — same "canvas = pixels, DOM = meaning"
 * split already established by LaunchOverlay, and no new font asset to
 * load. `distanceFactor` scales the tag down as the camera pulls away,
 * so the hero planet's label reads large on its close dwell and distant
 * planets' labels stay small without any manual scale math.
 */
export function PlanetLabel({
  visual,
  name,
  kind,
}: {
  visual: PlanetVisual;
  name: string;
  kind: PlanetKind;
}) {
  const [x, y, z] = visual.position;

  return (
    <Html
      position={[x, y + visual.radius + 0.5, z]}
      center
      distanceFactor={10}
      style={{ pointerEvents: "none" }}
    >
      <span className={`${styles.label} ${KIND_CLASS[kind]}`}>{name}</span>
    </Html>
  );
}
