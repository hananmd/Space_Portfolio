# CLAUDE.md — Space Portfolio Project Constitution

Cinematic, scroll-driven space portfolio. Visitor travels through space; scroll progress (0→1) drives the entire experience. Feels like a Pixar short × NASA visuals. Owner: Hanan (2nd-year CS, UCSC). This portfolio is a hiring showcase — code quality is part of the product.

## Current mode

**PROTOTYPE MODE.** We are validating Chapter 1 (Launch, 0–15% scroll) on top of the core scroll engine before committing to the full 5-chapter experience. Do NOT build later chapters, audio, or mobile fallbacks until the decision gate in roadmap.md is passed.

## Working rules (non-negotiable)

1. **One feature per session.** Never generate the whole project or multiple phases at once. Check `progress.md` at session start; do exactly the next step listed there.
2. **Explain before code.** Before implementing any feature: (a) explain the architecture in plain language as if teaching a student who will be asked about it in an interview, (b) why this design, (c) pitfalls. Then implement.
3. **Update `progress.md` at the end of every session**: what was done, what's next, known bugs.
4. **If you disagree with a suggested approach, say so and explain why before coding.**
5. No speculative features. No unrequested sections. Increment strictly.
6. Content (skill names, project data, milestones) comes ONLY from `content.md`. Never invent portfolio content.

## Tech stack (fixed — do not add dependencies without asking)

- Next.js (App Router) + TypeScript (strict) + React
- React Three Fiber + Three.js + @react-three/drei
- GSAP + ScrollTrigger, Lenis (smooth scroll)
- Zustand (scroll/app state)
- Postprocessing (@react-three/postprocessing)
- Framer Motion (DOM overlays only, not 3D)
- Howler.js — Phase 7 only, do not install yet
- Deploy: Vercel

## Architecture rules

### Scroll system (the load-bearing core)
- NEVER tie camera or animation directly to wheel events.
- Lenis produces smooth scroll → normalized `progress` (0→1) stored in a Zustand store.
- Everything (camera position/target, timelines, planet rotation, particles, lighting, text opacity, audio later) derives from this single `progress` value.
- Chapters own progress ranges: Launch 0–0.15, Solar 0.15–0.40, Stations 0.40–0.70, Constellation 0.70–0.85, Finale 0.85–1.0. Each chapter receives a *local* progress (remapped 0→1 within its range) via a shared `remapProgress(start, end, p)` utility.
- Keep a dev-only debug HUD showing global + local progress (toggle with `d` key).

### Component structure
```
src/
  app/                  # Next.js app router, page shell
  components/
    canvas/             # R3F scene, camera rig, lights, postprocessing
    chapters/           # One folder per chapter (isolated, consumes progress only)
    overlay/            # DOM/HTML overlays (semantic, accessible)
    debug/              # Dev HUD
  hooks/                # useScrollProgress, useChapterProgress, etc.
  stores/               # Zustand stores
  lib/                  # timeline mapping, math utils, constants
  content/              # typed data derived from content.md
```
- Chapters must be isolated: a chapter component takes local progress and renders. No chapter imports another chapter.
- Camera logic lives in ONE camera rig component driven by a keyframe/timeline definition in `lib/`, not scattered across chapters.

### Code standards
- Strict TypeScript, no `any` unless justified with a comment.
- No duplicated logic — extract to `lib/` or hooks.
- Comment the *why* on non-obvious 3D/math code (lerps, easing, camera paths).
- Avoid rerenders: use refs + `useFrame` for per-frame values; Zustand selectors; never setState per frame.
- Use instancing for repeated geometry (stars, particles).
- Dispose geometries/textures properly; watch for R3F leak patterns.

### Performance targets
- 60 FPS on a modern desktop for the prototype scene.
- Respect `prefers-reduced-motion`: provide a reduced-motion mode (camera cuts instead of flights, minimal particles).
- Lazy-load chapter assets; compress textures (KTX2/basis where practical later).

### Accessibility (applies even in prototype)
- Overlay text in semantic HTML (headings, landmarks), high contrast, readable sizes.
- Keyboard: page must remain scrollable/navigable via keyboard.
- "Skip intro" button planned; stub the slot for it.

## Design language
Premium, minimal, Apple-level polish, NASA realism. Deep space blacks, soft bloom, cinematic lighting, elegant typography, no clutter, no generic UI kit look.

## What "done" means for any feature
Runs at target FPS, no console errors, no TypeScript errors, works with mouse wheel AND trackpad, explanation written in the session, `progress.md` updated.
