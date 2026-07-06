/**
 * Solar chapter planet copy — mirrored verbatim from content.md §2 (SKILLS).
 * Text only: no position/size/color here, see lib/solarLayout.ts for the
 * visual data (art-direction choices content.md doesn't make).
 */

export type PlanetKind = "hero" | "main" | "exploring";

export interface SkillPlanet {
  id: string;
  kind: PlanetKind;
  /** Camera visit order (content.md §2 lists main planets in visit order). */
  order: number;
  name: string;
  stack: readonly string[];
  /** DRAFT caption from content.md — Hanan to rewrite or approve. */
  caption: string;
}

export const SKILL_PLANETS: readonly SkillPlanet[] = [
  {
    id: "systems",
    kind: "hero",
    order: 0,
    name: "Systems programming",
    stack: ["C", "C++"],
    caption:
      "Foundation. Where I learned how memory, processes, and machines actually think.",
  },
  {
    id: "backend",
    kind: "main",
    order: 1,
    name: "Backend",
    stack: ["FastAPI", "Node.js", "PHP"],
    caption: "Built on top of the foundation. APIs, services, the connective tissue.",
  },
  {
    id: "databases",
    kind: "main",
    order: 2,
    name: "Databases",
    stack: ["PostgreSQL", "MySQL"],
    caption: "Where truth lives. Schema is destiny.",
  },
  {
    id: "ai-rag",
    kind: "main",
    order: 3,
    name: "AI / RAG systems",
    stack: ["LLMs", "Qdrant", "retrieval pipelines"],
    caption: "The newest layer. Retrieval, embeddings, reasoning at scale.",
  },
  {
    id: "system-design",
    kind: "exploring",
    order: 4,
    name: "System design",
    stack: ["caches", "queues", "rate limits"],
    caption: "Charting further out. Caches, queues, rate limits.",
  },
  {
    id: "mlops",
    kind: "exploring",
    order: 5,
    name: "MLOps",
    stack: ["pipelines", "model serving", "observability"],
    caption: "Distant signal. Pipelines, model serving, observability.",
  },
] as const;
