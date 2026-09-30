"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { useReducedMotionPreference } from "@/lib/use-reduced-motion";
import MembraneScene from "./MembraneScene";
import ContactForm from "./ContactForm";
import Accordion from "./Accordion";
import content from "./content.json";

const ease = [0.23, 1, 0.32, 1] as const;
const layers = [
  {
    name: "Cubierta",
    material: "Poliéster",
    title: "El contacto con su producción.",
    copy: "Cubierta de poliéster libre de ftalatos, preparada para trabajar en contacto con alimentos.",
    fact: "60 °C",
    caption: "Resistencia a la temperatura",
    color: "#b64a73",
    surface: "M41 180 309 25 476 122 343 199 309 180 175 257Z",
  },
  {
    name: "Matriz",
    material: "PVC",
    title: "La presión queda adentro.",
    copy: "Una matriz de PVC aporta hermeticidad y baja fluencia al conjunto de la membrana.",
    fact: "7,8 MPa",
    caption: "Resistencia hidrostática mínima",
    color: "#7f8c97",
    surface: "M343 215 476 138 578 196 443 273Z",
  },
  {
    name: "Soporte",
    material: "Poliéster tejido",
    title: "La fuerza está en la trama.",
    copy: "El tejido de poliéster sostiene la membrana frente a la tracción longitudinal y trapezoidal.",
    fact: "1100 dTex",
    caption: "Trama de fibra mínima",
    color: "#c1c2a9",
    surface: "M309 215 175 295 309 372 443 288Z",
  },
];
const machines = [
  {
    brand: "Bucher Vaslin",
    title: "Bucher XPert",
    image: "Bucher_XPert.png",
    width: 584,
    height: 394,
  },
  {
    brand: "Della Toffola",
    title: "Della Toffola",
    image: "Della-Toffola.png",
    width: 630,
    height: 405,
  },
  {
    brand: "Diemme",
    title: "Diemme Velvet T26",
    image: "Diemme-Velvet_T26.png",
    width: 689,
    height: 424,
  },
];
const brands = [
  "Buccolini",
  "Bucher Vaslin",
  "Defranceschi",
  "Della Toffola",
  "Diemme",
  "Pera",
  "Siprem",
  "Velo",
  "Willmes",
  "Otra marca",
];
const clients = [
  { image: "GrupoPeniaflor-1.svg", name: "Grupo Peñaflor" },
  { image: "Fecovita.png", name: "Fecovita" },
  { image: "Baggio.png", name: "Baggio" },
  { image: "Senetiner.svg", name: "Nieto Senetiner" },
  { image: "Takeda.svg", name: "Takeda" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Film({
  paused,
  muted,
  className = "",
}: {
  paused: boolean;
  muted: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = true;
    const sync = () => {
      if (paused || reduced || !visible || document.hidden) video.pause();
      else void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [paused, reduced]);
  return (
    <video
      ref={ref}
      className={className}
      loop
      muted={muted}
      playsInline
      preload="metadata"
      poster={withBasePath("/media/material-film-poster.jpg")}
      aria-label="Película de imágenes industriales y bodegas"
    >
      <source src={withBasePath("/media/material-film.mp4")} type="video/mp4" />
    </video>
  );
}

function MaterialExplorer({ paused }: { paused: boolean }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [instant, setInstant] = useState(false);
  const reduced = useReducedMotionPreference();
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (paused || reduced || !auto) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = false;
    const sync = () => {
      clearInterval(timer);
      if (visible && !document.hidden)
        timer = setInterval(() => {
          setInstant(false);
          setActive((index) => (index + 1) % layers.length);
        }, 4400);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.35 },
    );
    if (section.current) observer.observe(section.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [auto, paused, reduced]);
  const current = layers[active];
  const choose = (index: number, keyboard: boolean) => {
    setActive(index);
    setAuto(false);
    setInstant(keyboard);
  };
  return (
    <div ref={section} className="material-explorer">
      <div className="material-stage">
        <div className="material-grid" aria-hidden="true" />
        <span className="stage-label">Sección de la membrana</span>
        <svg
          viewBox="0 0 615 405"
          className="material-object"
          role="img"
          aria-label="Diagrama original de la membrana, con cubierta, matriz y soporte"
        >
          <image
            href={withBasePath("/images/membrane-layers.png")}
            width="615"
            height="405"
          />
          {layers.map((layer, index) => (
            <motion.path
              key={layer.name}
              d={layer.surface}
              fill={layer.color}
              stroke={layer.color}
              strokeWidth="1.5"
              initial={false}
              animate={{ opacity: active === index ? 0.24 : 0 }}
              transition={{ duration: reduced || instant ? 0 : 0.22, ease }}
            />
          ))}
        </svg>
        <div className="material-scale" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="material-caption">
          Seleccione una capa para explorar el material.
        </p>
      </div>
      <div className="material-info">
        <div
          className="layer-tabs"
          role="group"
          aria-label="Capas de la membrana"
        >
          {layers.map((layer, index) => (
            <button
              type="button"
              key={layer.name}
              aria-pressed={active === index}
              className={active === index ? "layer-tab selected" : "layer-tab"}
              onClick={(event) => choose(index, event.detail === 0)}
            >
              <span className="layer-dot" style={{ background: layer.color }} />
              {layer.name}
              {active === index && (
                <motion.span
                  className="layer-underline"
                  layoutId="layer-underline"
                  transition={{ duration: reduced || instant ? 0 : 0.22, ease }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="layer-description" aria-live={auto ? "off" : "polite"}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.name}
              initial={{
                opacity: 0,
                transform: reduced || instant ? "none" : "translateY(12px)",
              }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{
                opacity: 0,
                transform: reduced || instant ? "none" : "translateY(-6px)",
              }}
              transition={{ duration: reduced || instant ? 0 : 0.18, ease }}
            >
              <p className="material-name">{current.material}</p>
              <h3>{current.title}</h3>
              <p>{current.copy}</p>
              <div className="material-fact">
                <strong>{current.fact}</strong>
                <span>{current.caption}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          className="subtle-control"
          aria-pressed={auto}
          onClick={() => setAuto(!auto)}
        >
          {auto ? "Pausar recorrido por capas" : "Recorrer las capas"}
          <span aria-hidden="true">{auto ? "Ⅱ" : "▷"}</span>
        </button>
      </div>
    </div>
  );
}

function PressSelector({
  onQuote,
}: {
  onQuote: (brand: string, model: string) => void;
}) {
  const [brand, setBrand] = useState("Bucher Vaslin");
  const [model, setModel] = useState("");
  const [instant, setInstant] = useState(false);
  const reduced = useReducedMotionPreference();
  const machine = machines.find((item) => item.brand === brand);
  return (
    <div className="press-selector">
      <div className="press-visual">
        <div className="press-circle" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="press-image"
            key={brand}
            initial={{
              opacity: 0,
              transform: instant || reduced ? "none" : "translateX(22px)",
            }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: instant || reduced ? 0 : 0.22, ease }}
          >
            {machine ? (
              <Image
                src={withBasePath(`/images/${machine.image}`)}
                width={machine.width}
                height={machine.height}
                alt={`Prensa ${machine.title}`}
                sizes="(max-width: 800px) 85vw, 45vw"
              />
            ) : (
              <div className="custom-press">
                <svg viewBox="0 0 360 220" aria-hidden="true">
                  <path
                    d="M50 55h255v112H50zM50 55c-45 0-45 112 0 112M305 55c45 0 45 112 0 112M80 167v34m185-34v34M28 88h24m251 0h24M65 56v110"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span>Fabricación a medida</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="press-caption">
          <span>{machine?.title || brand}</span>
          <span>Prensa neumática</span>
        </div>
      </div>
      <div className="press-controls">
        <p className="selector-intro">Encuentre su repuesto</p>
        <h3>¿Con qué prensa trabaja?</h3>
        <div
          className="brand-options"
          role="group"
          aria-label="Marca de su prensa"
        >
          {brands.map((item) => (
            <button
              type="button"
              key={item}
              className={
                brand === item ? "brand-option selected" : "brand-option"
              }
              aria-pressed={brand === item}
              onClick={(event) => {
                setInstant(event.detail === 0);
                setBrand(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="model-label" htmlFor="press-model">
          Modelo de la prensa <span>Opcional</span>
        </label>
        <input
          id="press-model"
          value={model}
          onChange={(event) => setModel(event.target.value)}
          maxLength={100}
          placeholder="Por ejemplo, XPert 50"
        />
        <p className="selector-note">
          Si no conoce el modelo, podemos asesorarlo.
        </p>
        <a
          href="#contacto"
          className="button button-dark"
          onClick={() => onQuote(brand, model)}
        >
          Consultar por esta membrana <Arrow />
        </a>
      </div>
    </div>
  );
}

export default function Experience() {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [heroView, setHeroView] = useState<"material" | "film">("material");
  const [heroActiveLayer, setHeroActiveLayer] = useState(0);
  const [inspectionKey, setInspectionKey] = useState(0);
  const [inspectionInstant, setInspectionInstant] = useState(false);
  const [suggestedMessage, setSuggestedMessage] = useState("");
  const [filmOpen, setFilmOpen] = useState(false);
  const [filmPaused, setFilmPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const progressTransform = useTransform(
    progress,
    (value) => `scaleX(${value})`,
  );
  const still = paused || reduced;

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    node
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!filmOpen || !dialog.current) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [filmOpen]);
  const closeFilm = () => {
    dialog.current?.close();
    setFilmOpen(false);
  };
  const inspectLayer = (index: number, keyboard: boolean) => {
    setHeroActiveLayer(index);
    setInspectionInstant(keyboard || still);
    setInspectionKey((key) => key + 1);
  };

  return (
    <div ref={root} className="experience" data-paused={still}>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <motion.div
        className="reading-progress"
        style={{ transform: progressTransform }}
        aria-hidden="true"
      />
      <header className="experience-header">
        <a href="#inicio" className="wordmark" aria-label="Fateplas, inicio">
          FATEPLAS
          <span className="wordmark-dot" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#materiales">El material</a>
          <a href="#productos">Su prensa</a>
          <a href="#nosotros">Fateplas</a>
        </nav>
        <a href="#contacto" className="header-contact">
          Hablemos <Arrow diagonal />
        </a>
      </header>
      <main id="contenido">
        <section
          className="experience-hero"
          id="inicio"
          aria-labelledby="hero-title"
        >
          <div className="hero-meta">
            <span>Membranas para prensas</span>
            <span>Mendoza, Argentina</span>
          </div>
          <div className="hero-composition">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="headline-mask">
                  <span>Cada capa</span>
                </span>
                <span className="headline-mask">
                  <span>cuenta.</span>
                </span>
              </h1>
              <p className="hero-summary">
                Su producción necesita una membrana que responda. La fabricamos
                a la medida de su prensa.
              </p>
              <div className="hero-actions">
                <a href="#productos" className="button button-wine">
                  Encontrar mi membrana <Arrow />
                </a>
                <button
                  type="button"
                  className="film-link"
                  onClick={() => {
                    setFilmPaused(false);
                    setFilmOpen(true);
                  }}
                >
                  <span className="play-icon" aria-hidden="true">
                    ▷
                  </span>
                  Ver película<span className="film-duration">0:12</span>
                </button>
              </div>
            </div>
            <div className="hero-media">
              <div className="hero-stage">
                <div
                  className="hero-visual"
                  id="hero-material-scene"
                  data-view={heroView}
                >
                  {heroView === "material" ? (
                    <MembraneScene
                      paused={still || filmOpen}
                      activeLayer={heroActiveLayer}
                      inspectionKey={inspectionKey}
                      inspectionInstant={inspectionInstant}
                    />
                  ) : (
                    <Film
                      paused={still || filmOpen}
                      muted={muted}
                      className="hero-film"
                    />
                  )}
                </div>
                <div className="hero-stage-top">
                  <span className="live-mark">
                    <i />
                    {heroView === "material"
                      ? "El material, de cerca"
                      : "Industria en movimiento"}
                  </span>
                  <button
                    type="button"
                    className="round-control"
                    aria-label={
                      paused ? "Reanudar animaciones" : "Pausar animaciones"
                    }
                    aria-pressed={paused}
                    onClick={() => setPaused(!paused)}
                  >
                    {paused ? "▷" : "Ⅱ"}
                  </button>
                </div>
                <div className="hero-stage-bottom">
                  <div
                    className="view-switch"
                    role="group"
                    aria-label="Vista del hero"
                  >
                    <button
                      type="button"
                      aria-pressed={heroView === "material"}
                      onClick={() => setHeroView("material")}
                    >
                      Material
                    </button>
                    <button
                      type="button"
                      aria-pressed={heroView === "film"}
                      onClick={() => setHeroView("film")}
                    >
                      Industria
                    </button>
                  </div>
                  {heroView === "film" ? (
                    <button
                      type="button"
                      className="sound-control"
                      aria-pressed={!muted}
                      onClick={() => setMuted(!muted)}
                    >
                      {muted ? "Activar sonido" : "Silenciar"}
                    </button>
                  ) : (
                    <span className="scene-hint">
                      Mueva el cursor para explorar
                    </span>
                  )}
                </div>
              </div>
              {heroView === "material" && (
                <div
                  className="hero-inspection"
                  data-instant={inspectionInstant}
                >
                  <div className="hero-inspection-caption">
                    <span>Explore una capa</span>
                    <span aria-live={inspectionKey > 0 ? "polite" : "off"}>
                      <span className="sr-only">
                        {layers[heroActiveLayer].name}:{" "}
                      </span>
                      {layers[heroActiveLayer].material}
                    </span>
                  </div>
                  <div
                    className="hero-layer-controls"
                    role="group"
                    aria-label="Explorar las capas del material"
                  >
                    {layers.map((layer, index) => (
                      <button
                        type="button"
                        key={layer.name}
                        aria-pressed={heroActiveLayer === index}
                        aria-controls="hero-material-scene"
                        onClick={(event) =>
                          inspectLayer(index, event.detail === 0)
                        }
                      >
                        <span aria-hidden="true">0{index + 1}</span>
                        {layer.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="hero-foot">
            <span>Prensas neumáticas e hidroneumáticas</span>
            <a href="#materiales">
              Explore lo que hay adentro <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <section
          className="client-strip"
          aria-label="Empresas que confían en Fateplas"
        >
          <p>Parte de su producción.</p>
          <div>
            {clients.map((client) => (
              <Image
                key={client.name}
                src={withBasePath(`/images/${client.image}`)}
                alt={client.name}
                width={160}
                height={60}
                sizes="(max-width: 600px) 100px, 140px"
              />
            ))}
          </div>
        </section>
        <section
          id="materiales"
          className="material-section section-space"
          aria-labelledby="material-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>La composición importa</p>
            <h2 id="material-title">
              La diferencia
              <br />
              está adentro.
            </h2>
            <div className="section-intro">
              Tres capas que trabajan juntas. Explore qué aporta cada una a su
              membrana.
            </div>
          </div>
          <MaterialExplorer paused={still} />
          <div className="certification">
            <Image
              src={withBasePath(
                "/images/cit-removebg-preview-e1663298242847.png",
              )}
              alt="Centro de Investigaciones Toxicológicas S.A."
              width={80}
              height={74}
            />
            <p>
              Tela de calidad alimenticia, aprobada y certificada por el Centro
              de Investigaciones Toxicológicas S.A.
            </p>
            <span>Material apto para su industria</span>
          </div>
        </section>
        <div className="type-ribbon" aria-hidden="true">
          <div>
            <span>Hecha para su prensa.</span>
            <span>Lista para su producción.</span>
            <span>Hecha para su prensa.</span>
            <span>Lista para su producción.</span>
          </div>
        </div>
        <section
          id="productos"
          className="products-section section-space"
          aria-labelledby="product-title"
        >
          <div className="section-heading" data-reveal="heading">
            <p>Repuestos y fabricación a medida</p>
            <h2 id="product-title">
              Su prensa.
              <br />
              Nuestra membrana.
            </h2>
            <div className="section-intro">
              Trabajamos con las marcas del mercado, incluso con equipos cuyos
              repuestos originales ya no se consiguen.
            </div>
          </div>
          <PressSelector
            onQuote={(brand, model) =>
              setSuggestedMessage(
                `Quisiera consultar por una membrana para una prensa ${brand}${model.trim() ? `, modelo ${model.trim()}` : ""}.`,
              )
            }
          />
        </section>
        <section className="repair-section" aria-labelledby="repair-title">
          <div className="repair-art" aria-hidden="true">
            <div className="repair-sheet">
              <span />
              <span />
              <i />
            </div>
          </div>
          <div className="repair-copy" data-reveal="heading">
            <p>También cuidamos lo que ya tiene</p>
            <h2 id="repair-title">
              Un pequeño corte.
              <br />
              Una solución a mano.
            </h2>
            <p>
              Los kits de reparación permiten cubrir pequeños cortes o rajaduras
              de la membrana y continuar con su producción.
            </p>
            <a
              href="#contacto"
              className="text-link"
              onClick={() =>
                setSuggestedMessage(
                  "Quisiera consultar por un kit de reparación para mi membrana.",
                )
              }
            >
              Consultar por un kit <Arrow diagonal />
            </a>
          </div>
        </section>
        <section
          id="nosotros"
          className="about-section section-space"
          aria-labelledby="about-title"
        >
          <div className="about-photo" data-reveal="image">
            <Image
              src={withBasePath(
                "/images/simon-tartarotti-qcJUzFKLhF8-unsplash-scaled.jpg",
              )}
              alt="Viñedos de Mendoza"
              width={2560}
              height={1707}
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <span>Mendoza, Argentina</span>
          </div>
          <div className="about-copy" data-reveal="heading">
            <p>Fateplas de Vosso S.A.</p>
            <h2 id="about-title">
              Conocemos
              <br />
              sus tiempos.
            </h2>
            <p>
              Somos una empresa familiar con experiencia en la industria de
              alimentos y bebidas. Entendemos lo que significa detener una
              producción.
            </p>
            <p>
              Fabricamos membranas a medida y acompañamos a nuestros clientes
              con asesoramiento y atención personalizada.
            </p>
            <a href="#contacto" className="text-link">
              Hablemos de su equipo <Arrow diagonal />
            </a>
          </div>
        </section>
        <section
          className="testimonial-section"
          aria-labelledby="testimonial-title"
        >
          <Image
            src={withBasePath("/images/Osvaldo-Colilaff.jpg")}
            alt="Osvaldo Colilaf"
            width={140}
            height={140}
          />
          <div>
            <h2 id="testimonial-title" className="sr-only">
              La experiencia de nuestros clientes
            </h2>
            <blockquote>
              &quot;El resultado del prensado al utilizar la membrana es muy
              bueno.&quot;
            </blockquote>
            <p>
              Osvaldo Colilaf
              <span>Sector de compras y licitaciones, RPB S.A. Cuyo</span>
            </p>
          </div>
        </section>
        <section
          className="faq-section section-space"
          aria-labelledby="faq-title"
        >
          <div className="faq-heading">
            <p>Antes de elegir</p>
            <h2 id="faq-title">
              Las preguntas
              <br />
              que importan.
            </h2>
          </div>
          <Accordion items={content.faq} variant="faq" id="faq" />
        </section>
        <section
          id="contacto"
          className="contact-section section-space"
          aria-labelledby="contact-title"
        >
          <div className="contact-heading" data-reveal="heading">
            <p>Cuéntenos qué necesita</p>
            <h2 id="contact-title">
              Que su producción
              <br />
              siga adelante.
            </h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <p>
                Una membrana nueva, un kit o una consulta sobre su prensa.
                Estamos para asesorarlo.
              </p>
              <a href="tel:+542615114420">+54 261 5114420</a>
              <a href="mailto:fateplas@yahoo.com.ar">fateplas@yahoo.com.ar</a>
              <address>
                Independencia 70, Godoy Cruz
                <br />
                Mendoza, Argentina
              </address>
            </div>
            <ContactForm suggestedMessage={suggestedMessage} />
          </div>
        </section>
      </main>
      <footer className="experience-footer">
        <a href="#inicio" className="footer-wordmark">
          FATEPLAS
        </a>
        <div>
          <p>Fateplas de Vosso S.A.</p>
          <p>© {new Date().getFullYear()}</p>
          <a href="#inicio">Volver arriba ↑</a>
        </div>
      </footer>
      {filmOpen && (
        <dialog
          ref={dialog}
          className="film-dialog"
          aria-labelledby="film-title"
          onCancel={closeFilm}
          onClose={() => setFilmOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeFilm();
          }}
        >
          <div className="film-dialog-heading">
            <h2 id="film-title">Material. Precisión. Producción.</h2>
            <button
              type="button"
              className="round-control"
              aria-label="Cerrar película"
              onClick={closeFilm}
            >
              ×
            </button>
          </div>
          <Film
            paused={filmPaused || reduced}
            muted={muted}
            className="dialog-video"
          />
          <div className="film-dialog-footer">
            <span>Una mirada a la industria y sus materiales.</span>
            <div>
              <button
                type="button"
                aria-pressed={filmPaused}
                onClick={() => setFilmPaused(!filmPaused)}
              >
                {filmPaused ? "Reproducir" : "Pausar"}
              </button>
              <button
                type="button"
                aria-pressed={!muted}
                onClick={() => setMuted(!muted)}
              >
                {muted ? "Activar sonido" : "Silenciar"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
