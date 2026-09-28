"use client";

import Image from "next/image";
import OriginalIcon from "@/components/OriginalIcon";
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
  const animating = useRef(false);
  const pointerStart = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (
      paused ||
      interacted ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => setIndex((previous) => previous + 1),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused, interacted, slides.length]);
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
  const move = (direction: number) => {
    setInteracted(true);
    if (animating.current || resetting) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    animating.current = !reducedMotion;
    setIndex((previous) =>
      reducedMotion
        ? (previous + direction + slides.length) % slides.length
        : previous + direction,
    );
  };
  const finishTransition = () => {
    animating.current = false;
    if (index < 0 || index >= slides.length) {
      setResetting(true);
      setIndex((previous) => (previous + slides.length) % slides.length);
    }
  };
  return (
    <div
      className={`carousel carousel-${kind}`}
      role="region"
      aria-roledescription="carrusel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="carousel-window">
        <div
          className={`carousel-track${resetting ? " is-resetting" : ""}`}
          onTransitionEnd={finishTransition}
          style={
            {
              "--slide-index": index,
              "--loop-offset": slides.length,
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
      {kind === "logos" ? (
        <>
          <button
            type="button"
            className="carousel-arrow previous"
            aria-label="Clientes anteriores"
            onClick={() => move(-1)}
          >
            <OriginalIcon name="caret-left" width={12} height={25} />
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            aria-label="Más clientes"
            onClick={() => move(1)}
          >
            <OriginalIcon name="caret-right" width={12} height={25} />
          </button>
        </>
      ) : null}
    </div>
  );
}
