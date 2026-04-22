import { createElement, useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createForestExplorerScene } from "./createForestExplorerScene.mjs";

export function BabylonForestExplorer({ onSceneReady, options }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let engine;
    let explorer;

    try {
      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      explorer = createForestExplorerScene(engine, canvas, options);

      console.log("explorer:", explorer);
      console.log("scene:", explorer?.scene);
      console.log("activeCamera:", explorer?.scene?.activeCamera);

      if (onSceneReady) {
        onSceneReady(explorer);
      }

      engine.runRenderLoop(() => {
        explorer?.scene?.render();
      });
    } catch (err) {
      console.error("Scene creation failed:", err);
    }

    const handleResize = () => engine?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      explorer?.dispose?.();
      engine?.dispose?.();
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