"use client";

import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

/**
 * Full-screen effect chain, applied once to the whole rendered frame after
 * every object in the scene has been drawn.
 *
 * Order matters and is deliberate:
 * 1. Bloom reads the scene's true linear HDR colors (see the `flat` prop
 *    on the Canvas in Scene.tsx — renderer-level tone mapping is disabled
 *    so values above 1.0, like the sun highlight, the atmosphere rim, and
 *    the exhaust core, survive to reach this pass instead of being
 *    clamped away before Bloom can see them).
 * 2. BrightnessContrast + Vignette do the "color grade": crush blacks a
 *    touch deeper and darken the frame edges, without moving the hues.
 * 3. ToneMapping (ACES Filmic) runs LAST, compressing the graded HDR
 *    result back to displayable range. This replaces the tone mapping the
 *    Canvas would otherwise apply too early.
 * 4. SMAA runs after tone mapping — it works on the final display-ready
 *    (LDR) pixels, smoothing geometry edges (Earth's silhouette, rocket
 *    fins) via a cheap shader pass instead of real multisampling.
 *
 * multisampling is 0 (not the EffectComposer's real-MSAA option): Chrome's
 * own driver bug list flags MSAA as slow specifically on Intel integrated
 * GPUs (`msaa_is_slow` workaround, crbug.com/527565), which is common
 * hardware for this portfolio's audience (corporate laptops). SMAA gives
 * comparable edge quality without that cost.
 */
export function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.9}
        luminanceSmoothing={0.3}
        intensity={0.6}
        radius={0.6}
      />
      <BrightnessContrast brightness={-0.02} contrast={0.06} />
      <Vignette eskil={false} offset={0.25} darkness={0.6} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
