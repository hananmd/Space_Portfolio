/**
 * Stations chapter project copy — mirrored verbatim from content.md §3
 * (PROJECTS). Text only: no position/scale here, see lib/stationLayout.ts
 * for the visual data (art-direction choices content.md doesn't make).
 *
 * Fields not yet consumed by this session's geometry-only step (problem,
 * stack, showGithub/showLiveDemo, githubUrl) are defined now anyway —
 * same precedent as content/skills.ts's caption field, which SolarChapter's
 * step 1 didn't render either and PlanetLabel only picked up two steps
 * later. Keeps content.md parsed into typed data exactly once.
 */

export type ProjectStatus = "IN_BUILD" | "SHIPPED";

export interface ProjectStation {
  id: string;
  /** Docking order (content.md §3 lists stations in dock order). */
  order: number;
  name: string;
  status: ProjectStatus;
  badge?: string;
  stack: readonly string[];
  /** DRAFT problem statement from content.md — Hanan to rewrite or approve. */
  problem: string;
  /** Skill planet ids (content/skills.ts) this project defends. */
  defends: readonly string[];
  showGithub: boolean;
  showLiveDemo: boolean;
  /** TODO in content.md — Hanan to paste the repo URL. */
  githubUrl?: string;
}

export const PROJECT_STATIONS: readonly ProjectStation[] = [
  {
    id: "incident-copilot",
    order: 0,
    name: "AI Incident Copilot",
    status: "IN_BUILD",
    badge: "In build · v0",
    stack: [
      "FastAPI",
      "PostgreSQL",
      "SQLAlchemy",
      "Qdrant",
      "Redis",
      "Docker",
      "JWT",
    ],
    problem:
      "Incident response is slow because context is scattered. This assistant reads logs, retrieves relevant history, and drafts an incident summary in seconds.",
    defends: ["backend", "databases", "ai-rag"],
    showGithub: false,
    showLiveDemo: false,
  },
  {
    id: "maze",
    order: 1,
    name: "Maze of UCSC",
    status: "SHIPPED",
    stack: ["C", "custom rendering loop", "modular architecture"],
    problem:
      "A 3D maze, built from scratch in C. No engine, no shortcuts. Rendering, input, geometry — all hand-written.",
    defends: ["systems"],
    showGithub: true,
    showLiveDemo: false,
  },
  {
    id: "os-scheduler",
    order: 2,
    name: "OS Process Scheduler",
    status: "SHIPPED",
    stack: ["C", "paging", "preemption", "fork/sync"],
    problem:
      "A process scheduler in C — the fastest way to learn what an operating system actually does is to build one.",
    defends: ["systems"],
    showGithub: true,
    showLiveDemo: false,
  },
] as const;
