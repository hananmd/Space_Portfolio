/**
 * Constellation chapter milestone copy — mirrored verbatim from content.md
 * §4 (MILESTONES). Text only: no position/color here, see
 * lib/constellationLayout.ts for the visual data (art-direction choices
 * content.md doesn't make), same split as content/skills.ts and
 * content/projects.ts.
 */

export type MilestoneTier = "past" | "present" | "future";

export interface Milestone {
  id: string;
  /** Chronological position (1-based) — also the order stars connect in. */
  order: number;
  tier: MilestoneTier;
  name: string;
  /** DRAFT caption from content.md — Hanan to rewrite or approve. */
  caption: string;
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "started-cs",
    order: 1,
    tier: "past",
    name: "Started CS @ UCSC",
    caption: "First contact with computer science.",
  },
  {
    id: "maze",
    order: 2,
    tier: "past",
    name: "Maze of UCSC (first C project)",
    caption: "First real system, built end-to-end in C.",
  },
  {
    id: "blog-launch",
    order: 3,
    tier: "past",
    name: "Launched hananmd.github.io blog",
    caption: "Started writing in public — hananmd.github.io.",
  },
  {
    id: "os-scheduler",
    order: 4,
    tier: "past",
    name: "OS Process Scheduler",
    caption: "Learned what an OS does by writing one.",
  },
  {
    id: "opsidian-hackathon",
    order: 5,
    tier: "past",
    name: "Opsidian: Genesis hackathon (Infrastructure & Integration)",
    caption:
      "First MLOps mission. CI/CD, deployment, DagsHub pipeline — shipped under pressure.",
  },
  {
    id: "students-union",
    order: 6,
    tier: "past",
    name: "Students' Union / IUD Section Committee",
    caption: "Leadership beyond code.",
  },
  {
    id: "incident-copilot",
    order: 7,
    tier: "present",
    name: "AI Incident Copilot — in build",
    caption: "Currently building. Week 8 gate ahead.",
  },
  {
    id: "dsa-practice",
    order: 8,
    tier: "present",
    name: "DSA — daily practice",
    caption: "Consistent training. Long-arc discipline.",
  },
  {
    id: "system-design-deepening",
    order: 9,
    tier: "present",
    name: "System design — deepening",
    caption: "Studying caches, queues, rate limits at depth.",
  },
  {
    id: "first-internship",
    order: 10,
    tier: "future",
    name: "First SWE internship (Sri Lankan tech)",
    caption: "Target: next internship season. Sri Lankan tech.",
  },
  {
    id: "graduate-ucsc",
    order: 11,
    tier: "future",
    name: "Graduate UCSC — 2027",
    caption: "Mission checkpoint.",
  },
] as const;
