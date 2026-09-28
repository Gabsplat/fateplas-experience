"use client";

import { withBasePath } from "@/lib/base-path";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const navigation = [
  ["Nuestros productos", "#nuestros-productos"],
  ["Nuestros clientes", "#nuestros-clientes"],
  ["¿Quiénes somos?", "#quienes-somos"],
  ["FAQ", "#faq"],
  ["Contacto", "#contacto"],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navRef.current?.querySelector<HTMLButtonElement>(".menu-close")?.focus();
    const desktop = window.matchMedia("(min-width: 769px)");
    const handleResize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", handleResize);
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href="#inicio"
          aria-label="Fateplas, inicio"
          onClick={() => setOpen(false)}
        >
          <Image
            src={withBasePath(
              "/images/Logo3DFrente6-removebg-preview-1-e1662416470451-240x43.png",
            )}
            width={240}
            height={43}
            alt="Fateplas"
            priority
            className="header-logo"
          />
        </a>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
            <path
              fill="currentColor"
              d={
                open
                  ? "m6 4 6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6-6-6z"
                  : "M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"
              }
            />
          </svg>
        </button>
        {open ? (
          <button
            type="button"
            className="menu-backdrop"
            aria-label="Cerrar menú"
            onClick={close}
          />
        ) : null}
        <div
          ref={navRef}
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          id="main-navigation"
          className={open ? "main-navigation is-open" : "main-navigation"}
          aria-label={open ? "Menú" : undefined}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
            if (open && event.key === "Tab") {
              const targets = navRef.current?.querySelectorAll<
                HTMLButtonElement | HTMLAnchorElement
              >("button, a");
              const first = targets?.[0];
              const last = targets?.[targets.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <button
            type="button"
            className="menu-close"
            aria-label="Cerrar menú"
            onClick={close}
          >
            <svg
              width="17"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.293 6.707l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l5.293-5.293 5.293 5.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-5.293-5.293 5.293-5.293c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z" />
            </svg>
          </button>
          <nav className="menu-links" aria-label="Navegación principal">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
