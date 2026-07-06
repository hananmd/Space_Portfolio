"use client";

import { useEffect, useRef } from "react";
import { chapterProgress } from "@/lib/chapters";
import { PROJECT_STATIONS } from "@/content/projects";
import {
  activeStationOpacity,
  stationsChapterPresence,
} from "@/lib/stationsTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/stores/scrollStore";
import styles from "./StationPanel.module.css";

/**
 * Stations chapter's DOM overlay: problem statement, tech stack, and
 * GitHub/demo buttons for whichever project is currently docked. All 3
 * panels are always mounted, stacked in the same slot, and cross-fade via
 * refs written from a store subscription — same getState()-in-refs idiom
 * as LaunchOverlay and the camera rig, so a scroll tick never triggers a
 * React re-render here. `visibility` (not just opacity) toggles alongside
 * opacity so a hidden panel's links leave the tab order and a11y tree
 * instead of trapping keyboard focus on off-screen content.
 */
export function StationPanel() {
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const apply = (progress: number) => {
      const local = chapterProgress("stations", progress);
      const presence = stationsChapterPresence(progress);
      for (const project of PROJECT_STATIONS) {
        const el = panelRefs.current[project.id];
        if (!el) continue;
        const opacity = activeStationOpacity(local, project.id) * presence;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity > 0.02 ? "visible" : "hidden";
      }
    };

    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <div className={styles.wrap}>
      {PROJECT_STATIONS.map((project) => (
        <div
          key={project.id}
          ref={(el) => {
            panelRefs.current[project.id] = el;
          }}
          className={
            reducedMotion ? styles.panel : `${styles.panel} ${styles.animated}`
          }
        >
          {project.badge && <span className={styles.badge}>{project.badge}</span>}
          <h2 className={styles.name}>{project.name}</h2>
          <p className={styles.problem}>{project.problem}</p>
          <ul className={styles.stack}>
            {project.stack.map((tech) => (
              <li key={tech} className={styles.stackItem}>
                {tech}
              </li>
            ))}
          </ul>
          {(project.showGithub && project.githubUrl) ||
          (project.showLiveDemo && project.demoUrl) ? (
            <div className={styles.actions}>
              {project.showGithub && project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.button}
                >
                  GitHub
                </a>
              )}
              {project.showLiveDemo && project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.button}
                >
                  Live demo
                </a>
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
