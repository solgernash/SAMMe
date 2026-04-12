import { createElement, useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createForestExplorerScene } from "./createForestExplorerScene.mjs";

/**
 * Minimal React wrapper for the forest explorer scene.
 *
 * Example:
 * <BabylonForestExplorer
 *   onSceneReady={(explorer) => {
 *     // Parent your loaded avatar root to explorer.avatarAnchor here.
 *   }}
 * />
 */
export function BabylonForestExplorer({ onSceneReady, options }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    const explorer = createForestExplorerScene(engine, canvas, options);
    if (onSceneReady) {
      onSceneReady(explorer);
    }

    engine.runRenderLoop(() => {
      explorer.scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      explorer.dispose();
      engine.dispose();
    };
  }, [onSceneReady, options]);

  return createElement("canvas", {
    ref: canvasRef,
    style: {
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "none",
    },
  });
}
