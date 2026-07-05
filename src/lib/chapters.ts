import { remapProgress } from "./math";

/**
 * Chapter ranges over global scroll progress (0→1).
 * These are the single source of truth — chapters, camera timeline and
 * (later) audio all reference these constants, never magic numbers.
 */
export const CHAPTERS = {
  launch: { start: 0.0, end: 0.15, label: "Launch" },
  solar: { start: 0.15, end: 0.4, label: "Solar" },
  stations: { start: 0.4, end: 0.7, label: "Stations" },
  constellation: { start: 0.7, end: 0.85, label: "Constellation" },
  finale: { start: 0.85, end: 1.0, label: "Finale" },
} as const;

export type ChapterId = keyof typeof CHAPTERS;

export const CHAPTER_IDS = Object.keys(CHAPTERS) as ChapterId[];

/** Local 0→1 progress within a chapter, clamped outside its range. */
export function chapterProgress(id: ChapterId, globalProgress: number): number {
  const { start, end } = CHAPTERS[id];
  return remapProgress(start, end, globalProgress);
}
