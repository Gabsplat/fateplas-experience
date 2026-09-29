"use client";

import { useReducedMotionPreference } from "@/lib/use-reduced-motion";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import styles from "./HeroMedia.module.css";

const photos = [
  {
    src: "/images/crystal-kwok-XUEdfpPIhXg-unsplash-scaled.jpg",
    alt: "Equipamiento y conductos de una planta industrial",
  },
  {
    src: "/images/ant-rozetsky-SLIFI67jv5k-unsplash-scaled.jpg",
    alt: "Instalaciones de producción industrial",
  },
];

export default function HeroMedia() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [instant, setInstant] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  useEffect(() => {
    if (paused || focused || hovered || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % photos.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [paused, focused, hovered, reducedMotion]);

  return (
    <div
      className={styles.media}
      role="region"
      aria-label="Imágenes de la industria"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {photos.map((photo, photoIndex) => (
        <motion.div
          key={photo.src}
          className={styles.photo}
          aria-hidden={index !== photoIndex}
          initial={false}
          animate={{ opacity: index === photoIndex ? 1 : 0 }}
          transition={{
            duration: reducedMotion || instant ? 0 : paused ? 0.25 : 0.7,
            ease: [0.77, 0, 0.175, 1],
          }}
        >
          <Image
            src={withBasePath(photo.src)}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            preload={photoIndex === 0}
            className={styles.image}
          />
        </motion.div>
      ))}
      <div className={styles.controls}>
        <span className={styles.counter} aria-hidden="true">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          aria-label="Siguiente imagen industrial"
          onClick={(event) => {
            setInstant(event.detail === 0);
            setPaused(true);
            setIndex((value) => (value + 1) % photos.length);
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
