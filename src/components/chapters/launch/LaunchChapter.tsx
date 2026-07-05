"use client";

import { Earth } from "./Earth";
import { Rocket } from "./Rocket";
import { Starfield } from "./Starfield";

/**
 * Chapter 1 — Launch. Composes the chapter's world; each piece reads the
 * chapter-local progress itself (via the store, per-frame) so nothing
 * outside this folder needs to know what Launch contains.
 *
 * Phase 2 build order: Earth + starfield → rocket (this step) →
 * choreography → overlay text → post.
 */
export function LaunchChapter() {
  return (
    <>
      <Starfield />
      <Earth />
      {/* TEMPORARY placement for step-2 review: foreground-right of Earth,
          slightly turned so the porthole and a fin silhouette read from the
          start camera pose. Step 3 (choreography) owns the real pad
          position, ascent path, and rocket-vs-Earth scale story. */}
      <group position={[3.6, -0.2, 6]} rotation={[0, -0.35, 0]}>
        <Rocket />
      </group>
    </>
  );
}
