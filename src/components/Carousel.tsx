"use client";

import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string; width: number; height: number };

export default function Carousel({
  slides,
  kind,
}: {
  slides: Slide[];
  kind: "logos" | "products";
}) {
  const [index, setIndex] = useState(0);
  const [resetting, setResetting] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [instant, setInstant] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  useEffect(() => {
    if (hovered || focused || interacted || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((previous) => previous + 1),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [hovered, focused, interacted, reducedMotion, slides.length]);
  useEffect(() => {
    if (!resetting) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setResetting(false));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [resetting]);
  const move = (direction: number, keyboard = false) => {
    setInteracted(true);
    const immediate =
      !!reducedMotion || keyboard || index < 0 || index >= slides.length;
    setInstant(immediate);
    setIndex((previous) =>
      immediate
        ? (previous + direction + slides.length) % slides.length
        : previous + direction,
    );
  };
  const finishTransition = () => {
    if (index < 0 || index >= slides.length) {
      setResetting(true);
      setIndex((previous) => (previous + slides.length) % slides.length);
    }
  };
  const current = (index + slides.length) % slides.length;
  return (
    <div
      className={`carousel carousel-${kind}`}
      role="region"
      aria-roledescription="carrusel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1, true);
        }
      }}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (
          pointerStart.current !== null &&
          Math.abs(event.clientX - pointerStart.current) > 40
        )
          move(event.clientX < pointerStart.current ? 1 : -1);
        pointerStart.current = null;
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      aria-label={
        kind === "logos"
          ? "Empresas que confían en Fateplas"
          : "Modelos de prensas"
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {kind === "products" && (
        <div className="carousel-technical-header" aria-hidden="true">
          <span>Modelos compatibles</span>
          <span>
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}
      <div className="carousel-window">
        <div
          className={`carousel-track${resetting ? " is-resetting" : ""}`}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "transform"
            )
              finishTransition();
          }}
          style={
            {
              "--slide-index": index,
              "--loop-offset": slides.length,
              transition: instant ? "none" : undefined,
            } as React.CSSProperties
          }
        >
          {slides.concat(slides, slides).map((slide, slideIndex) => (
            <div
              key={`${slide.src}-${slideIndex}`}
              className="carousel-slide"
              aria-hidden={
                kind === "products"
                  ? slideIndex !== index + slides.length
                  : slideIndex < slides.length ||
                    slideIndex >= slides.length * 2
              }
            >
              <Image
                src={slide.src}
                width={slide.width}
                height={slide.height}
                alt={slide.alt}
                sizes={
                  kind === "logos"
                    ? "(max-width: 767px) 340px, (max-width: 1024px) 180px, 157px"
                    : "(max-width: 767px) 360px, (max-width: 1024px) 310px, 630px"
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        {kind === "products" && (
          <p
            className="carousel-caption"
            aria-live={interacted ? "polite" : "off"}
            aria-atomic="true"
          >
            {slides[current].alt}
          </p>
        )}
        <button
          type="button"
          className="carousel-arrow previous"
          aria-label={
            kind === "logos" ? "Clientes anteriores" : "Prensa anterior"
          }
          onClick={(event) => move(-1, event.detail === 0)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M19 12H5m5-5-5 5 5 5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="carousel-arrow next"
          aria-label={kind === "logos" ? "Más clientes" : "Prensa siguiente"}
          onClick={(event) => move(1, event.detail === 0)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12h14m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {kind === "products" && (
        <div className="carousel-pagination" aria-label="Elegir modelo">
          {slides.map((slide, slideIndex) => (
            <button
              key={`${slide.src}-${slideIndex}`}
              type="button"
              aria-label={`Ver modelo ${slideIndex + 1}: ${slide.alt}`}
              aria-current={current === slideIndex ? "true" : undefined}
              onClick={(event) => {
                setInteracted(true);
                setInstant(reducedMotion || event.detail === 0);
                setIndex(slideIndex);
              }}
            >
              <span aria-hidden="true">
                {String(slideIndex + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
