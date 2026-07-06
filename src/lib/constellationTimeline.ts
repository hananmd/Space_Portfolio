import { MILESTONES } from "@/content/milestones";
import { clamp01, easeSmoothstep } from "./math";

/**
 * Progressive illumination choreography for the Constellation chapter —
 * roadmap.md: "stars illuminate + connect per milestone." Layered on top
 * of the camera timeline the same way stationsTimeline.ts layers panel
 * opacity on the docking shots: pure functions of constellation-LOCAL
 * progress, so scrolling back un-lights the constellation reversibly.
 *
 * Timing: each star finishes lighting at a uniformly spread local-progress
 * moment between REVEAL_START and REVEAL_END, in chronological `order`
 * (content.md's connect-the-dots order). The uniform spread is chosen to
 * land each tier inside the camera shot that frames it (beats from
 * cameraTimeline.ts): past stars (orders 1–6) complete by ~0.38 while the
 * camera arrives at / lingers near the past cluster (beat 0.12), present
 * stars (7–9) at ~0.44–0.57 during the present-cluster traverse (beat
 * 0.42), future stars (10–11) at ~0.64–0.70 during the pull-back, so the
 * wide reveal (beat 0.72) always shows the completed pattern. Fractions
 * are art direction, not content.md fact — same class of judgment call as
 * the camera beat fractions themselves.
 *
 * The connecting line reveals in lockstep: its tip glides from star k to
 * star k+1 exactly while star k+1 fades in, expressed as the sum of all
 * illumination fractions (see lineReveal below) rather than a second,
 * separately-tuned track that could drift from the star timing.
 */

const STAR_COUNT = MILESTONES.length;

/** Local progress at which the FIRST star finishes lighting. */
const REVEAL_START = 0.06;

/** Local progress at which the LAST star finishes lighting — just before
 *  the wide-reveal camera beat (constellation-local 0.72 in
 *  cameraTimeline.ts), so the pull-back never catches a half-lit sky. */
const REVEAL_END = 0.7;

/** Width of one star's fade-in window, in local progress. Kept strictly
 *  below the gap between consecutive lit times ((0.7 − 0.06) / 10 = 0.064)
 *  so stars light one at a time — "per milestone" — rather than in
 *  overlapping pairs. */
const FADE = 0.05;

/** Local progress at which star `order` (1-based chronological) is fully
 *  lit. */
function litAt(order: number): number {
  return (
    REVEAL_START + ((order - 1) / (STAR_COUNT - 1)) * (REVEAL_END - REVEAL_START)
  );
}

/**
 * How illuminated star `order` is at constellation-local progress `local`:
 * 0 = not yet revealed (invisible), 1 = full TIER brightness. This scales
 * the tier's intensity story (Star.tsx), it never overrides it — a fully
 * "lit" future star is still content.md's dim gray, not bright.
 */
export function starIllumination(order: number, local: number): number {
  const end = litAt(order);
  return easeSmoothstep(clamp01((local - (end - FADE)) / FADE));
}

/**
 * Continuous tip position of the connecting line along the chronological
 * polyline, in vertex units [0, STAR_COUNT − 1]: 3.5 means "the line runs
 * from star 1 to halfway between stars 4 and 5" (1-based orders).
 *
 * Defined as Σ starIllumination − 1: lighting star 1 lights the starting
 * dot without extending a line, and every later star's fade-in advances
 * the tip by exactly one segment. Because the fade windows are sequential
 * and non-overlapping, the tip reaches each star at the exact moment that
 * star finishes lighting — the two effects can never drift apart because
 * they are the same function.
 */
export function lineReveal(local: number): number {
  let sum = 0;
  for (const m of MILESTONES) {
    sum += starIllumination(m.order, local);
  }
  return Math.max(0, sum - 1);
}
