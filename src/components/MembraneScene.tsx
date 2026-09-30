"use client";

import { useEffect, useRef, useState } from "react";
import MembraneFallback from "./MembraneFallback";
import styles from "./MembraneRenderer.module.css";
import type { createMembraneRenderer } from "@/lib/membrane-gpu";

interface MembraneSceneProps {
  paused?: boolean;
  className?: string;
  activeLayer?: number;
  inspectionKey?: number;
  inspectionInstant?: boolean;
}

type Renderer = Awaited<ReturnType<typeof createMembraneRenderer>>;

export default function MembraneScene({
  paused = false,
  className = "",
  activeLayer = -1,
  inspectionKey = 0,
  inspectionInstant = false,
}: MembraneSceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const options = useRef({
    paused,
    activeLayer,
    inspectionKey,
    inspectionInstant,
  });
  const sync = useRef<(() => void) | null>(null);

  useEffect(() => {
    options.current = { paused, activeLayer, inspectionKey, inspectionInstant };
    sync.current?.();
  }, [paused, activeLayer, inspectionKey, inspectionInstant]);

  useEffect(() => {
    const element = root.current;
    const drawing = canvas.current;
    if (!element || !drawing) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let renderer: Renderer | undefined;
    let disposed = false;
    let initializing = false;
    let visible = false;
    let failed = false;
    let raf = 0;
    let previous = 0;
    let time = 0;
    let scan = 1;
    let inspection = 0;
    let inspectionHold = 0;
    let scanDelay = 0;
    let lastInspection = options.current.inspectionKey;
    const pointer: [number, number] = [0, 0];
    const goal = [0, 0];
    const velocity = [0, 0];

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
    }

    function draw() {
      renderer?.render({
        time: reduced.matches ? 5 : time,
        pointer,
        activeLayer: options.current.activeLayer,
        scan,
        inspection,
        reducedMotion: reduced.matches,
      });
    }

    function canAnimate() {
      return (
        renderer &&
        !failed &&
        visible &&
        !document.hidden &&
        !options.current.paused &&
        !reduced.matches
      );
    }

    function tick(now: number) {
      raf = 0;
      if (!canAnimate()) return;
      if (previous && now - previous < 1000 / (fine.matches ? 60 : 30) - 0.5) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = previous ? Math.min((now - previous) / 1000, 0.035) : 0;
      previous = now;
      time += dt;
      inspectionHold = Math.max(0, inspectionHold - dt);
      inspection +=
        ((inspectionHold > 0 ? 1 : 0) - inspection) * (1 - Math.exp(-dt * 10));
      scanDelay = Math.max(0, scanDelay - dt);
      if (scanDelay === 0) scan = Math.min(1, scan + dt / 1.15);
      for (let axis = 0; axis < 2; axis++) {
        velocity[axis] +=
          ((goal[axis] - pointer[axis]) * 100 - velocity[axis] * 10) * dt;
        pointer[axis] += velocity[axis] * dt;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    function refresh() {
      if (disposed) return;
      const next = options.current;
      if (lastInspection !== next.inspectionKey) {
        lastInspection = next.inspectionKey;
        const instant =
          next.inspectionInstant || next.paused || reduced.matches;
        scan = instant ? 1 : 0;
        inspectionHold = 3;
        scanDelay = instant ? 0 : 0.35;
        if (instant) inspection = 1;
      }
      if (canAnimate()) {
        element!.dataset.motion = "running";
        if (!raf) raf = requestAnimationFrame(tick);
      } else {
        stop();
        element!.dataset.motion = "stopped";
        if (visible && !document.hidden) draw();
      }
    }

    async function initialize() {
      if (initializing || renderer || failed || disposed) return;
      initializing = true;
      try {
        if (!navigator.gpu) throw new Error("WebGPU unavailable");
        const { createMembraneRenderer } = await import("@/lib/membrane-gpu");
        const next = await createMembraneRenderer(drawing!, {
          onDeviceLost: () => {
            if (disposed) return;
            failed = true;
            stop();
            renderer?.dispose();
            setReady(false);
            element!.dataset.motion = "stopped";
          },
        });
        if (disposed || failed) {
          next.dispose();
          return;
        }
        renderer = next;
        next.resize();
        draw();
        setReady(true);
        refresh();
      } catch (error) {
        failed = true;
        element!.dataset.gpuError =
          error instanceof Error ? error.message : "GPU initialization failed";
      }
    }

    function move(event: PointerEvent) {
      if (!fine.matches || reduced.matches || options.current.paused) return;
      const rect = element!.getBoundingClientRect();
      goal[0] = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      goal[1] = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    function leave() {
      goal[0] = goal[1] = 0;
    }
    function mediaChanged() {
      leave();
      pointer[0] = pointer[1] = velocity[0] = velocity[1] = 0;
      scan = 1;
      refresh();
    }

    sync.current = refresh;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) void initialize();
        refresh();
      },
      { threshold: 0.01 },
    );
    observer.observe(element);
    const resize = new ResizeObserver(() => {
      renderer?.resize();
      if (visible && !document.hidden) draw();
    });
    resize.observe(element);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", refresh);
    reduced.addEventListener("change", mediaChanged);
    fine.addEventListener("change", mediaChanged);

    return () => {
      disposed = true;
      sync.current = null;
      stop();
      observer.disconnect();
      resize.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", refresh);
      reduced.removeEventListener("change", mediaChanged);
      fine.removeEventListener("change", mediaChanged);
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={root}
      className={`${styles.scene} ${className}`}
      data-renderer={ready ? "webgpu" : "svg"}
    >
      <div
        className={styles.fallback}
        aria-hidden={ready}
        style={{ visibility: ready ? "hidden" : "visible" }}
      >
        <MembraneFallback paused={paused || ready} activeLayer={activeLayer} />
      </div>
      <canvas
        ref={canvas}
        className={styles.canvas}
        style={{ opacity: ready ? 1 : 0 }}
        aria-hidden={!ready}
        role="img"
        aria-label="Membrana flexible de tres capas con luz rasante y relieve del tejido"
      />
    </div>
  );
}
