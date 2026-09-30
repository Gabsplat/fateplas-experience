"use client";

import { motion } from "motion/react";
import { type CSSProperties, useId, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { useReducedMotionPreference } from "@/lib/use-reduced-motion";
import styles from "./MaterialDiagram.module.css";

// Keep the original image intact. SVG overlays identify surfaces without
// cutting, recoloring or moving the underlying photograph.
const originalImage = withBasePath("/images/membrane-layers.png");
const surfaces = [
  "M41 180 309 25 476 122 343 199 309 180 175 257Z",
  "M343 215 476 138 578 196 443 273Z",
  "M309 215 175 295 309 372 443 288Z",
];
const layers = [
  {
    short: "Cubierta",
    title: "Cubierta de poliéster",
    label: "Ver cubierta de poliéster",
    fact: "60 °C",
    caption: "Temperatura máxima",
    detail: "Cubierta libre de ftalatos.",
    hotspot: [283, 120],
    color: "#ac3362",
  },
  {
    short: "Matriz",
    title: "Matriz de PVC",
    label: "Ver matriz de pvc",
    fact: "7,8 MPa",
    caption: "Resistencia hidrostática mínima",
    detail: "Hermeticidad y baja fluencia.",
    hotspot: [467, 209],
    color: "#424b51",
  },
  {
    short: "Soporte",
    title: "Soporte de poliéster",
    label: "Ver soporte de poliéster",
    fact: "1100 dTex",
    caption: "Trama de fibra mínima",
    detail: "Resiste la tracción longitudinal y trapezoidal.",
    hotspot: [302, 313],
    color: "#939b94",
  },
] as const;

export default function MaterialDiagram({
  paused = false,
}: {
  paused?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [active, setActive] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [instant, setInstant] = useState(false);
  const [scan, setScan] = useState(0);
  const reducedMotion = useReducedMotionPreference();
  const selected = hovered ?? active;
  const immediate = paused || reducedMotion || instant;
  const panelId = `${id}-details`;

  function choose(index: number, keyboard = false) {
    setInstant(keyboard);
    setHovered(null);
    setActive(index);
    setScan((previous) => previous + 1);
  }
  function reset(keyboard = false) {
    choose(0, keyboard);
  }

  return (
    <div
      className={styles.diagram}
      data-motion-paused={immediate}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          reset(true);
        }
      }}
    >
      <div className={styles.stage}>
        <div className={styles.meta} aria-hidden="true">
          <span>Composición de la membrana</span>
          <span>03 capas</span>
        </div>
        <div
          className={styles.scene}
          style={
            {
              "--anchor-x": `${(layers[selected].hotspot[0] / 615) * 100}%`,
              "--anchor-y": `${(layers[selected].hotspot[1] / 420) * 100}%`,
            } as CSSProperties
          }
          onPointerLeave={() => {
            setHovered(null);
          }}
        >
          <svg
            className={styles.svg}
            viewBox="0 0 615 420"
            width="615"
            height="420"
            role="group"
            aria-label="Capas de la tela de la membrana"
          >
            <defs>
              <linearGradient id={`${id}-light`}>
                <stop stopColor="white" stopOpacity="0" />
                <stop offset=".5" stopColor="white" stopOpacity=".55" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              {surfaces.map((surface, index) => (
                <clipPath key={index} id={`${id}-surface-${index}`}>
                  <path d={surface} />
                </clipPath>
              ))}
            </defs>
            <image
              href={originalImage}
              width="615"
              height="406"
              pointerEvents="none"
            />
            {layers.map((layer, index) => (
              <g
                key={index}
                data-material-layer={index}
                data-selected={selected === index}
              >
                <path
                  d={surfaces[index]}
                  fill="transparent"
                  className={styles.layer}
                  aria-hidden="true"
                  onPointerEnter={(event) => {
                    if (
                      event.pointerType === "mouse" &&
                      window.matchMedia("(hover: hover) and (pointer: fine)")
                        .matches
                    ) {
                      setInstant(false);
                      setHovered(index);
                      setScan((previous) => previous + 1);
                    }
                  }}
                  onClick={() => choose(index)}
                />
                <motion.path
                  d={surfaces[index]}
                  pointerEvents="none"
                  aria-hidden="true"
                  fill={index === 2 ? "none" : layer.color}
                  fillOpacity={index === 0 ? 0.25 : 0.18}
                  stroke={index === 2 ? "#ac3362" : layer.color}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeDasharray={index === 2 ? "3 5" : undefined}
                  initial={false}
                  animate={{ opacity: selected === index ? 1 : 0 }}
                  transition={{
                    duration: immediate ? 0 : 0.18,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                />
                {selected === index && scan > 0 && !immediate ? (
                  <g
                    clipPath={`url(#${id}-surface-${index})`}
                    pointerEvents="none"
                    aria-hidden="true"
                  >
                    <rect
                      key={scan}
                      className={styles.lightSweep}
                      x="-150"
                      y="0"
                      width="150"
                      height="406"
                      fill={`url(#${id}-light)`}
                    />
                  </g>
                ) : null}
                <g
                  className={styles.hotspot}
                  role="button"
                  tabIndex={0}
                  aria-label={layer.label}
                  aria-pressed={active === index}
                  aria-controls={panelId}
                  onClick={(event) => choose(index, event.detail === 0)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      choose(index, true);
                    }
                  }}
                  onFocus={() => {
                    setInstant(true);
                    setHovered(null);
                  }}
                >
                  <circle
                    cx={layer.hotspot[0]}
                    cy={layer.hotspot[1]}
                    r="23"
                    fill="transparent"
                  />
                  <motion.circle
                    cx={layer.hotspot[0]}
                    cy={layer.hotspot[1]}
                    r="18"
                    fill="none"
                    stroke="#ac3362"
                    strokeWidth="1"
                    pointerEvents="none"
                    initial={false}
                    animate={{ opacity: selected === index ? 0.45 : 0 }}
                    transition={{ duration: immediate ? 0 : 0.18 }}
                  />
                  <circle
                    className={styles.hotspotRing}
                    cx={layer.hotspot[0]}
                    cy={layer.hotspot[1]}
                    r="12"
                    fill="white"
                    stroke={layer.color}
                    strokeWidth="1.5"
                  />
                  {selected === index ? (
                    <circle
                      cx={layer.hotspot[0]}
                      cy={layer.hotspot[1]}
                      r="4"
                      fill="#ac3362"
                      pointerEvents="none"
                    />
                  ) : (
                    <path
                      d={`M${layer.hotspot[0] - 4} ${layer.hotspot[1]}h8m-4 -4v8`}
                      stroke={layer.color}
                      strokeWidth="1.5"
                      fill="none"
                      pointerEvents="none"
                    />
                  )}
                </g>
              </g>
            ))}
            <g
              aria-hidden="true"
              pointerEvents="none"
              fill="none"
              stroke="#ac3362"
              strokeWidth="1.2"
            >
              <path
                className={styles.leader}
                d={`M${layers[selected].hotspot[0] - 26} ${layers[selected].hotspot[1] - 70}v14l26 21v35`}
              />
              <path
                className={styles.mobileLeader}
                d={`M283 0v16L${layers[selected].hotspot[0]} ${layers[selected].hotspot[1] - 30}v30`}
              />
            </g>
          </svg>
          <div
            id={panelId}
            className={styles.description}
            aria-live={hovered === null ? "polite" : "off"}
            aria-atomic="true"
          >
            <motion.div
              key={selected}
              className={styles.card}
              initial={immediate ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: immediate ? 0 : 0.18 }}
            >
              <span className={styles.index} aria-hidden="true">
                {String(selected + 1).padStart(2, "0")}
              </span>
              <div className={styles.copy}>
                <h3>{layers[selected].title}</h3>
                <strong className={styles.fact}>{layers[selected].fact}</strong>
                <span className={styles.caption}>
                  {layers[selected].caption}
                </span>
                <p>{layers[selected].detail}</p>
              </div>
            </motion.div>
          </div>
          <button
            className={styles.reset}
            type="button"
            aria-label="Volver a cubierta"
            disabled={active === 0 && hovered === null}
            onClick={(event) => reset(event.detail === 0)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 11a8 8 0 1 1 2 6M4 4v7h7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className={styles.hint}>
          Seleccione una capa para explorar el material.
        </p>
      </div>
      <div className={styles.controls} aria-label="Materiales">
        {layers.map((layer, index) => (
          <button
            key={layer.short}
            type="button"
            className={styles.tab}
            aria-pressed={active === index}
            aria-controls={panelId}
            data-highlighted={selected === index}
            onClick={(event) => choose(index, event.detail === 0)}
          >
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            {layer.short}
          </button>
        ))}
      </div>
    </div>
  );
}
