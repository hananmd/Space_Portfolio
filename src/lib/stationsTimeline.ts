import { CHAPTERS } from "./chapters";
import { remapProgress } from "./math";

/**
 * Panel visibility/crossfade choreography for the Stations chapter's
 * holographic UI panel, layered on top of the docking camera timeline in
 * cameraTimeline.ts. Two independent gates multiply together:
 *
 * 1. `stationsChapterPresence` — is ANY panel on screen at all. Computed
 *    from GLOBAL progress (not stations-local) because chapterProgress()
 *    clamps local to 1 forever once global passes the Stations range —
 *    gating on local alone would leave the last station's panel glued to
 *    the screen through Constellation and Finale once those exist.
 * 2. `activeStationOpacity` — WHICH station's panel is showing, computed
 *    from stations-LOCAL progress with a short crossfade dip at each
 *    switch boundary so consecutive panels dissolve rather than cut.
 *
 * Switch boundaries sit at the midpoint between one station's camera hold
 * and the next station's arrival in cameraTimeline.ts (Incident Copilot's
 * linger at 0.30 vs. the Maze flyby at 0.55 → 0.425; Maze at 0.55 vs. OS
 * Scheduler's approach at 0.8 → 0.675) — reusing the existing
 * choreography's beats rather than inventing unrelated numbers, since
 * content.md specifies dock order and per-station panel detail but no
 * explicit panel-timing spec of its own. Flagged as a judgment call, same
 * as the shared station camera offset in cameraTimeline.ts.
 */

const DIP = 0.03;
const BOUNDARY_1 = 0.425;
const BOUNDARY_2 = 0.675;

interface PanelWindow {
  start: number;
  end: number;
  fadeInAtStart: boolean;
  fadeOutAtEnd: boolean;
}

const PANEL_WINDOWS: Readonly<Record<string, PanelWindow>> = {
  "incident-copilot": {
    start: 0,
    end: BOUNDARY_1,
    fadeInAtStart: false,
    fadeOutAtEnd: true,
  },
  maze: {
    start: BOUNDARY_1,
    end: BOUNDARY_2,
    fadeInAtStart: true,
    fadeOutAtEnd: true,
  },
  "os-scheduler": {
    start: BOUNDARY_2,
    end: 1,
    fadeInAtStart: true,
    fadeOutAtEnd: false,
  },
};

/** Opacity 0→1 for one station's panel at Stations-LOCAL progress `local`. */
export function activeStationOpacity(local: number, stationId: string): number {
  const w = PANEL_WINDOWS[stationId];
  if (!w) return 0;
  if (local < w.start || local > w.end) return 0;
  if (w.fadeInAtStart && local < w.start + DIP) {
    return remapProgress(w.start, w.start + DIP, local);
  }
  if (w.fadeOutAtEnd && local > w.end - DIP) {
    return 1 - remapProgress(w.end - DIP, w.end, local);
  }
  return 1;
}

const STATIONS = CHAPTERS.stations;
/** Fade span at the chapter's edges, in GLOBAL progress units. */
const PRESENCE_FADE = 0.02;

/**
 * Overall panel presence (0→1), gated on GLOBAL progress so the last
 * station's panel doesn't linger once Constellation claims the scroll.
 */
export function stationsChapterPresence(globalProgress: number): number {
  if (globalProgress < STATIONS.start || globalProgress > STATIONS.end) {
    return 0;
  }
  if (globalProgress < STATIONS.start + PRESENCE_FADE) {
    return remapProgress(
      STATIONS.start,
      STATIONS.start + PRESENCE_FADE,
      globalProgress
    );
  }
  if (globalProgress > STATIONS.end - PRESENCE_FADE) {
    return 1 - remapProgress(STATIONS.end - PRESENCE_FADE, STATIONS.end, globalProgress);
  }
  return 1;
}
