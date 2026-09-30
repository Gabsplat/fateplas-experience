"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./MembraneScene.module.css";

export interface MembraneFallbackProps {
  paused?: boolean;
  className?: string;
  /** Polyester coating, PVC matrix, and woven polyester support. */
  activeLayer?: number;
}

type Point = [number, number];

// A projected flexible specimen, rather than an illustration of a rigid block.
// Every surface follows the same saddle, so the exploded view stays legible.
function project(u: number, v: number, elevation = 0): Point {
  const curl = 72 * Math.cos((u + 245) / 145) + 0.00042 * v * v;
  return [
    400 + u * 0.94 + v * 0.59,
    390 + u * 0.27 - v * 0.49 - (curl + elevation) * 0.94,
  ];
}

function path(points: Point[], close = false) {
  return `${points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}${close ? " Z" : ""}`;
}

function edge(v: number, elevation = 0): Point[] {
  return Array.from({ length: 81 }, (_, i) =>
    project(-245 + (490 * i) / 80, v, elevation),
  );
}

function perimeter(elevation = 0) {
  return path(
    [...edge(146, elevation), ...edge(-146, elevation).reverse()],
    true,
  );
}

const strips = Array.from({ length: 100 }, (_, i) => {
  const u = -245 + (490 * i) / 100;
  const next = u + 4.96;
  // Soft studio lighting on the curved polymer, with a broad grazing highlight.
  const normal = Math.sin((u + 245) / 145);
  const light = Math.round(184 + 44 * normal + 12 * Math.cos(u / 48));
  return {
    d: path(
      [
        project(u, 146),
        project(next, 146),
        project(next, -146),
        project(u, -146),
      ],
      true,
    ),
    color: `rgb(${light}, ${light + 2}, ${light + 1})`,
    dark: `rgb(${Math.round(light * 0.17)}, ${Math.round(light * 0.18)}, ${Math.round(light * 0.19)})`,
  };
});

const warp = Array.from({ length: 59 }, (_, i) => path(edge(-146 + i * 5)));
const weft = Array.from({ length: 99 }, (_, i) => {
  const u = -245 + i * 5;
  return path(
    Array.from({ length: 21 }, (_, j) => project(u, -146 + (292 * j) / 20)),
  );
});

export default function MembraneFallback({
  paused = false,
  className = "",
  activeLayer,
}: MembraneFallbackProps) {
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");

  useEffect(() => {
    const container = root.current;
    const object = tilt.current;
    if (!container || !object) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let inView = true;
    let running = false;
    let frame = 0;
    let previous = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let targetX = 0;
    let targetY = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000 || 1 / 60, 1 / 30);
      previous = now;
      // mass: 1, stiffness: 100, damping: 10. Preserve velocity on interruption.
      vx += ((targetX - x) * 100 - vx * 10) * dt;
      vy += ((targetY - y) * 100 - vy * 10) * dt;
      x += vx * dt;
      y += vy * dt;
      object.style.transform = `perspective(1100px) rotateX(${y}deg) rotateY(${x}deg)`;
      if (
        Math.abs(targetX - x) +
          Math.abs(targetY - y) +
          Math.abs(vx) +
          Math.abs(vy) >
          0.01 &&
        running
      ) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        previous = 0;
      }
    };

    const start = () => {
      if (!frame && running && finePointer.matches)
        frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      running = !paused && !reduced.matches && !document.hidden && inView;
      container.dataset.motion = running ? "running" : "paused";
      if (!running) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        if (reduced.matches) object.style.transform = "none";
      } else start();
    };

    const move = (event: PointerEvent) => {
      if (!running || !finePointer.matches || event.pointerType === "touch")
        return;
      const rect = container.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 11;
      targetY = -((event.clientY - rect.top) / rect.height - 0.5) * 9;
      start();
    };

    const leave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(container);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerleave", leave);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
    };
  }, [paused]);

  return (
    <div
      ref={root}
      className={`${styles.scene} ${className}`}
      data-motion={paused ? "paused" : "running"}
    >
      <div className={styles.ground} aria-hidden="true" />
      <div ref={tilt} className={styles.tilt}>
        <svg
          className={styles.specimen}
          viewBox="0 0 800 700"
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
        >
          <title id={`${id}-title`}>La membrana, capa por capa</title>
          <desc id={`${id}-description`}>
            Estudio de una lámina flexible con cubierta de poliéster, matriz de
            PVC y soporte tejido de poliéster. Las capas se separan para mostrar
            su estructura.
          </desc>
          <defs>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#f6f7f5" />
              <stop offset="0.45" stopColor="#888b89" />
              <stop offset="1" stopColor="#e2e4e1" />
            </linearGradient>
            <linearGradient id={`${id}-polymer`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#f5f5ef" />
              <stop offset="0.4" stopColor="#c8c9c2" />
              <stop offset="1" stopColor="#aaa9a2" />
            </linearGradient>
            <pattern
              id={`${id}-grain`}
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="2" r="0.45" fill="#111" opacity="0.15" />
              <circle cx="5" cy="5" r="0.5" fill="#fff" opacity="0.3" />
            </pattern>
            <clipPath id={`${id}-clip`}>
              <path d={perimeter()} />
            </clipPath>
          </defs>
          <g className={styles.assembly}>
            <g
              className={`${styles.layer} ${styles.bottom}`}
              data-selected={activeLayer === 2 || undefined}
            >
              <g transform="translate(0 85)">
                <path d={perimeter(-2)} fill="#74746b" opacity="0.45" />
                <path
                  d={perimeter()}
                  fill={`url(#${id}-polymer)`}
                  opacity="0.54"
                />
                <g clipPath={`url(#${id}-clip)`} fill="none">
                  {warp.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      stroke="#777468"
                      strokeWidth="1.5"
                      opacity="0.75"
                    />
                  ))}
                  {weft.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      stroke="#f6f3e6"
                      strokeWidth="1.7"
                      opacity="0.9"
                    />
                  ))}
                  {warp.map((d, i) => (
                    <path key={i} d={d} stroke="#dddace" strokeWidth="0.6" />
                  ))}
                </g>
                <path
                  d={perimeter()}
                  fill="none"
                  stroke="#cac6b7"
                  strokeWidth="1.5"
                />
                <path d={perimeter()} className={styles.selection} />
              </g>
            </g>
            <g
              className={`${styles.layer} ${styles.mesh}`}
              data-selected={activeLayer === 1 || undefined}
            >
              <g transform="translate(0 -2)">
                <path d={perimeter(-7)} fill="#131518" />
                {strips.map((strip, i) => (
                  <path key={i} d={strip.d} fill={strip.dark} />
                ))}
                <path d={perimeter()} fill={`url(#${id}-grain)`} />
                <path
                  d={path(edge(-146))}
                  fill="none"
                  stroke="#676965"
                  strokeWidth="1.2"
                />
                <path d={perimeter()} className={styles.selection} />
              </g>
            </g>
            <g
              className={`${styles.layer} ${styles.top}`}
              data-selected={activeLayer === 0 || undefined}
            >
              <g transform="translate(0 -102)">
                <path d={perimeter(-5)} fill="#7e817d" />
                {strips.map((strip, i) => (
                  <path key={i} d={strip.d} fill={strip.color} />
                ))}
                <path d={perimeter()} fill={`url(#${id}-grain)`} />
                <path
                  d={path(edge(-146))}
                  fill="none"
                  stroke={`url(#${id}-rim)`}
                  strokeWidth="2"
                />
                <path
                  d={path(edge(146))}
                  fill="none"
                  stroke="#fafbf8"
                  strokeWidth="0.8"
                  opacity="0.55"
                />
                <path d={perimeter()} className={styles.selection} />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
