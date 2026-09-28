"use client";

import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

import { MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import styles from "./MaterialDiagram.module.css";

const layers = [
  {
    title: "Cubierta de poliéster",
    label: "Ver cubierta de poliéster",
    material: "Poliéster",
    offset: -54,
    points: [
      "Libre de ftalatos",
      "Alta estabilidad fisicoquímica",
      "Soporta altas temperaturas (Máx. 60° C)",
    ],
  },
  {
    title: "Matriz de PVC",
    label: "Ver matriz de pvc",
    material: "PVC",
    offset: 42,
    points: [
      "Hermeticidad y baja fluencia (Resist. hidrostática mín. 7,8 MPa)",
    ],
  },
  {
    title: "Soporte de poliéster",
    label: "Ver soporte de poliéster",
    material: "Poliéster",
    offset: 138,
    points: [
      "Trama de fibra (Mín. 1100 dTex)",
      "Resistente a la tracción longitudinal y trapezoidal",
    ],
  },
];

const face = "M108 188 310 72 548 209 346 326Z";
const leftEdge = "M108 188 346 326 346 338 108 200Z";
const rightEdge = "M346 326 548 209 548 221 346 338Z";

export default function MaterialDiagram() {
  const id = useId().replace(/:/g, "");
  const panelId = `${id}-description`;
  const [active, setActive] = useState(0);
  const [instant, setInstant] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  const selected = layers[active];
  const immediate = reducedMotion || instant;

  function selectLayer(index: number, keyboard = false) {
    setInstant(keyboard);
    setActive(index);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.diagram} data-instant={instant || undefined}>
        <div className={styles.visual}>
          <div className={styles.visualHeading}>
            <span>Estructura de la membrana</span>
            <span>Tres capas</span>
          </div>
          <svg
            className={styles.svg}
            viewBox="0 0 660 530"
            width="660"
            height="530"
            role="img"
            aria-labelledby={`${id}-title ${id}-summary`}
          >
            <title id={`${id}-title`}>Capas de la tela de la membrana</title>
            <desc id={`${id}-summary`}>
              Cubierta de poliéster, matriz de PVC y soporte de poliéster.
              Seleccioná una capa con los botones para conocer sus propiedades.
            </desc>
            <defs>
              <linearGradient id={`${id}-cover`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8afc3" />
                <stop offset="0.48" stopColor="#ce7495" />
                <stop offset="1" stopColor="#ac3362" />
              </linearGradient>
              <linearGradient id={`${id}-pvc`} x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#687076" />
                <stop offset="0.5" stopColor="#40484d" />
                <stop offset="1" stopColor="#242c30" />
              </linearGradient>
              <linearGradient id={`${id}-fabric`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f8f7f0" />
                <stop offset="1" stopColor="#d8d9d2" />
              </linearGradient>
              <pattern
                id={`${id}-weave`}
                width="9"
                height="9"
                patternUnits="userSpaceOnUse"
                patternTransform="matrix(.866 .5 -.866 .5 0 0)"
              >
                <path
                  d="M0 0H9M0 0V9"
                  fill="none"
                  stroke="#9caaa5"
                  strokeWidth="1.15"
                  opacity=".6"
                />
                <path
                  d="M3 0V9M0 3H9"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  opacity=".85"
                />
              </pattern>
              <pattern
                id={`${id}-coating`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r=".65" fill="#fff" opacity=".14" />
              </pattern>
              <radialGradient id={`${id}-shadow`}>
                <stop offset="0" stopColor="#35473c" stopOpacity=".12" />
                <stop offset="1" stopColor="#35473c" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="345"
              cy="482"
              rx="270"
              ry="36"
              fill={`url(#${id}-shadow)`}
            />
            <path
              d="M88 206 88 432M80 206H96M80 432H96"
              fill="none"
              stroke="#c8cec9"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            {[2, 1, 0].map((index) => {
              const layer = layers[index];
              const isActive = active === index;
              const fill = ["cover", "pvc", "fabric"][index];
              const edgeLeft = ["#993258", "#232c31", "#b6beb6"][index];
              const edgeRight = ["#84254a", "#151d22", "#a0ada3"][index];
              return (
                <g key={layer.title} transform={`translate(0 ${layer.offset})`}>
                  <motion.g
                    initial={false}
                    animate={{
                      transform: isActive
                        ? "translate(0px, -12px)"
                        : "translate(0px, 0px)",
                      opacity: isActive ? 1 : 0.87,
                    }}
                    transition={{
                      duration: immediate ? 0 : 0.25,
                      ease: [0.77, 0, 0.175, 1],
                    }}
                    className={styles.layer}
                    data-material-layer={index}
                    onClick={() => selectLayer(index)}
                    aria-hidden="true"
                  >
                    <path d={leftEdge} fill={edgeLeft} />
                    <path d={rightEdge} fill={edgeRight} />
                    <path
                      d={face}
                      fill={`url(#${id}-${fill})`}
                      stroke={index === 2 ? "#c5cdc3" : edgeLeft}
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                    <path
                      d={face}
                      fill={`url(#${id}-${index === 2 ? "weave" : "coating"})`}
                    />
                    <path
                      d="M110 188 310 73 546 209"
                      fill="none"
                      stroke="#fff"
                      strokeOpacity={index === 1 ? ".22" : ".5"}
                      strokeWidth="1.2"
                    />
                    <path d="M346 328V336" stroke="#fff" strokeOpacity=".25" />
                    <path
                      d="M549 210H583"
                      fill="none"
                      stroke={isActive ? "#ac3362" : "#9ca8a0"}
                    />
                    <circle
                      cx="585"
                      cy="210"
                      r="3"
                      fill={isActive ? "#ac3362" : "#9ca8a0"}
                    />
                    <text
                      x="597"
                      y="215"
                      className={styles.layerNumber}
                      fill={isActive ? "#ac3362" : "#65776a"}
                    >
                      0{index + 1}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </svg>
          <p className={styles.visualCaption}>
            Seleccioná una capa para explorar el material.
          </p>
        </div>
        <div className={styles.information}>
          <div
            className={styles.controls}
            aria-label="Seleccionar capa de la membrana"
          >
            {layers.map((layer, index) => (
              <button
                key={layer.title}
                type="button"
                className={styles.control}
                aria-label={layer.label}
                aria-pressed={active === index}
                aria-controls={panelId}
                onClick={(event) => selectLayer(index, event.detail === 0)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    setInstant(true);
                }}
              >
                <span className={styles.controlNumber}>0{index + 1}</span>
                <span>{layer.title}</span>
                <span className={styles.controlArrow} aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
          <div
            className={styles.description}
            id={panelId}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.material}>{selected.material}</span>
            <h3>{selected.title}</h3>
            <ul>
              {selected.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
