"use client";

import { withBasePath } from "@/lib/base-path";
import { useState } from "react";

const layers = [
  {
    title: "Cubierta de poliéster",
    x: 291,
    y: 77,
    path: "M158.5 258.5L24.5 181.5L292 26L459 122.5L326 200L293 182L158.5 258.5Z",
    fill: "#AB1578",
    points: [
      "Libre de ftalatos",
      "Alta estabilidad fisicoquímica",
      "Soporta altas temperaturas (Máx. 60° C)",
    ],
  },
  {
    title: "Matriz de PVC",
    x: 443,
    y: 207,
    path: "M426 274.5L325.5 215.5L458.5 139L559.5 197.5L426 274.5Z",
    fill: "black",
    points: [
      "Hermeticidad y baja fluencia (Resist. hidrostática mín. 7,8 MPa)",
    ],
  },
  {
    title: "Soporte de poliéster",
    x: 295,
    y: 293,
    path: "M292.5 215L158 295.5L292.5 371.5L426 288L292.5 215Z",
    fill: "white",
    points: [
      "Trama de fibra (Mín. 1100 dTex)",
      "Resistente a la tracción longitudinal y trapezoidal",
    ],
  },
];

export default function MaterialDiagram() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="material-diagram">
      <div className="diagram-canvas">
        <svg
          viewBox="0 0 598 415"
          width="598"
          height="415"
          role="group"
          aria-label="Capas de la tela de la membrana"
        >
          <image
            href={withBasePath("/images/membrane-layers.png")}
            x="-17"
            y="9"
            width="615"
            height="406"
          />
          {active !== null ? (
            <path
              d={layers[active].path}
              fill={layers[active].fill}
              opacity="0.8"
            />
          ) : null}
          {layers.map((layer, index) => (
            <g
              key={layer.title}
              className="diagram-control"
              role="button"
              tabIndex={0}
              aria-label={`Ver ${layer.title.toLowerCase()}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActive(index);
                }
              }}
            >
              <circle
                className={
                  active === index
                    ? "diagram-circle selected"
                    : "diagram-circle"
                }
                cx={layer.x}
                cy={layer.y}
                r="10"
                stroke="#ab1578"
                strokeWidth="6"
                fill="#f5aedd"
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="diagram-divider" />
      <div className="diagram-description" aria-live="polite">
        {active === null ? (
          <p className="diagram-hint">
            ¡Hacé click en los círculos del gráfico para más información!
          </p>
        ) : (
          <>
            <h3>{layers[active].title}</h3>
            <ul>
              {layers[active].points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
