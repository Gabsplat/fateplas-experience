"use client";

import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

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
  const pointerStart = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [instant, setInstant] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  useEffect(() => {
    if (hovered || focused || userPaused || interacted || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((previous) => previous + 1),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [hovered, focused, userPaused, interacted, reducedMotion, slides.length]);
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
        <button
          type="button"
          className="carousel-arrow previous"
          aria-label={
            kind === "logos" ? "Clientes anteriores" : "Prensa anterior"
          }
          onClick={(event) => move(-1, event.detail === 0)}
        >
          <OriginalIcon name="caret-left" width={12} height={25} />
        </button>
        {kind === "products" ? (
          <p className="carousel-caption">
            {slides[(index + slides.length) % slides.length].alt}
            <span className="carousel-counter">
              {((index + slides.length) % slides.length) + 1} / {slides.length}
            </span>
          </p>
        ) : null}
        <button
          type="button"
          className="carousel-arrow next"
          aria-label={kind === "logos" ? "Más clientes" : "Prensa siguiente"}
          onClick={(event) => move(1, event.detail === 0)}
        >
          <OriginalIcon name="caret-right" width={12} height={25} />
        </button>
      </div>
      {!reducedMotion ? (
        <button
          type="button"
          className="carousel-playback"
          onClick={() => {
            if (userPaused || interacted) {
              setUserPaused(false);
              setInteracted(false);
              setInstant(false);
            } else setUserPaused(true);
          }}
          aria-label={`${userPaused || interacted ? "Reanudar" : "Pausar"} carrusel de ${kind === "logos" ? "clientes" : "prensas"}`}
        >
          {userPaused || interacted ? "Reanudar" : "Pausar"}
        </button>
      ) : null}
    </div>
  );
}
