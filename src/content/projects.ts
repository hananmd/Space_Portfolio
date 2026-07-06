/**
 * Stations chapter project copy — mirrored verbatim from content.md §3
 * (PROJECTS). Text only: no position/scale here, see lib/stationLayout.ts
 * for the visual data (art-direction choices content.md doesn't make).
 *
 * All fields are consumed by components/overlay/StationPanel.tsx.
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
  /** Repo URL from content.md §3. Optional because incident-copilot has
   *  showGithub:false (button gate) and no URL yet. */
  githubUrl?: string;
  /** No station has showLiveDemo:true in v1; kept optional for symmetry
   *  with githubUrl so the panel can render this button the same way
   *  once a project needs it. */
  demoUrl?: string;
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
    githubUrl: "https://github.com/hananmd/MAZE-PROJECT",
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
    githubUrl: "https://github.com/hananmd/MultiLevelQueue",
  },
] as const;
