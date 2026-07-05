"use client";

import { Earth } from "./Earth";
import { Starfield } from "./Starfield";

/**
 * Chapter 1 — Launch. Composes the chapter's world; each piece reads the
 * chapter-local progress itself (via the store, per-frame) so nothing
 * outside this folder needs to know what Launch contains.
 *
 * Phase 2 build order: Earth + starfield (this step) → rocket →
 * choreography → overlay text → post.
 */
export function LaunchChapter() {
  return (
    <>
      <Starfield />
      <Earth />
    </>
  );
}
