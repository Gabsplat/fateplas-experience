import { withBasePath } from "@/lib/base-path";
import Image from "next/image";
import Header from "@/components/Header";
import OriginalIcon from "@/components/OriginalIcon";
import Carousel from "@/components/Carousel";
import Accordion from "@/components/Accordion";
import MaterialDiagram from "@/components/MaterialDiagram";
import ContactForm from "@/components/ContactForm";
import content from "@/components/content.json";

const logos = [
  {
    src: withBasePath("/images/Baggio.png"),
    alt: "Baggio",
    width: 460,
    height: 180,
  },
  {
    src: withBasePath("/images/Fecovita.png"),
    alt: "Fecovita",
    width: 306,
    height: 67,
  },
  {
    src: withBasePath("/images/logo-v2@3x.png"),
    alt: "Elea",
    width: 199,
    height: 80,
  },
  {
    src: withBasePath("/images/Senetiner.svg"),
    alt: "Nieto Senetiner",
    width: 106,
    height: 35,
  },
  {
    src: withBasePath("/images/Takeda.svg"),
    alt: "Takeda",
    width: 500,
    height: 168,
  },
  {
    src: withBasePath("/images/Pernod-Ricard-Logo-800x450-1.png"),
    alt: "Pernod Ricard",
    width: 800,
    height: 450,
  },
  {
    src: withBasePath("/images/download__4_-removebg-preview.png"),
    alt: "Bodegas Chandon",
    width: 282,
    height: 179,
  },
  {
    src: withBasePath("/images/download-removebg-preview.png"),
    alt: "Bodega Norton",
    width: 225,
    height: 225,
  },
  {
    src: withBasePath("/images/download__2_-removebg-preview.png"),
    alt: "Bodega Salentein",
    width: 250,
    height: 145,
  },
  {
    src: withBasePath("/images/download__1_-removebg-preview.png"),
    alt: "Bodega Argento",
    width: 389,
    height: 129,
  },
  {
    src: withBasePath("/images/download__3_-removebg-preview.png"),
    alt: "Bodega Trivento",
    width: 184,
    height: 100,
  },
  {
    src: withBasePath("/images/GrupoPeniaflor-1.svg"),
    alt: "Grupo Peñaflor",
    width: 373,
    height: 71,
  },
];
const presses = [
  {
    src: withBasePath("/images/Della-Toffola_2.png"),
    alt: "Prensa Della Toffola",
    width: 592,
    height: 421,
  },
  {
    src: withBasePath("/images/Diemme-Velvet_T26.png"),
    alt: "Prensa Diemme Velvet T26",
    width: 612,
    height: 408,
  },
  {
    src: withBasePath("/images/Bucher_XPert.png"),
    alt: "Prensa Bucher XPert",
    width: 640,
    height: 390,
  },
  {
    src: withBasePath("/images/Della-Toffola.png"),
    alt: "Prensa Della Toffola",
    width: 700,
    height: 463,
  },
];

function Divider({ className = "" }: { className?: string }) {
  return <div className={`section-divider ${className}`} aria-hidden="true" />;
}
function QuoteLink({ children }: { children: React.ReactNode }) {
  return (
    <a className="quote-button" href="#contacto">
      {children}
    </a>
  );
}
function ServiceIcon({ type }: { type: "check" | "alert" | "question" }) {
  const name =
    type === "check"
      ? "check-circle"
      : type === "alert"
        ? "exclamation-circle"
        : "question-circle";
  return (
    <OriginalIcon name={name} className="service-icon" width={50} height={50} />
  );
}
function BenefitIcon({ type }: { type: "tag" | "shield" | "clock" }) {
  return (
    <OriginalIcon
      name={type === "shield" ? "shield-alt" : type}
      width={23}
      height={23}
    />
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <div className="hero-spacer" id="inicio" />
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-background hero-background-first" />
          <div className="hero-background hero-background-second" />
          <div className="hero-overlay" />
          <div className="container hero-container">
            <div className="hero-copy">
              <h1 id="hero-title">
                <strong>Seguridad</strong>, <strong>calidad</strong> y{" "}
                <strong>precio</strong>
                <br />
                en sus repuestos de
                <br />
                membrana
              </h1>
              <p>
                Membranas para prensas neumáticas e hidroneumáticas,
                <br />a medida
              </p>
              <QuoteLink>Necesito una cotización</QuoteLink>
            </div>
          </div>
        </section>
        <section
          className="introduction section-padding"
          aria-labelledby="intro-title"
        >
          <div className="container introduction-grid">
            <div className="introduction-copy column-padding">
              <h2 id="intro-title" className="heading-medium">
                ¿Le gustaría adquirir una ventaja competitiva en su negocio?
              </h2>
              <Divider />
              <p>
                La clave está en respaldar su producción con la seguridad de un
                buen proveedor.
              </p>
              <p>Complete su stock de repuestos de membranas ahora mismo.</p>
              <p className="accent">
                <strong>
                  Incorpore un proveedor de confianza que sepa responder a
                  tiempo.
                </strong>
              </p>
            </div>
            <div className="introduction-image">
              <Image
                unoptimized
                src={withBasePath(
                  "/images/jim-harris-zDlusnb3G3Q-unsplash-scaled.jpg",
                )}
                width={2560}
                height={1920}
                alt="Barricas en una bodega"
                sizes="(max-width: 767px) 360px, (max-width: 1024px) 360px, 675px"
              />
            </div>
          </div>
        </section>
        <section className="trusted" aria-labelledby="trusted-title">
          <div className="container column-padding">
            <h2 className="heading-medium" id="trusted-title">
              Confían en nosotros
            </h2>
            <Divider />
            <Carousel slides={logos} kind="logos" />
          </div>
        </section>
        <section
          className="products section-padding dark-section"
          id="nuestros-productos"
          aria-labelledby="products-title"
        >
          <div className="container two-columns">
            <div className="column-padding products-copy">
              <h2 className="heading-medium" id="products-title">
                Membranas para prensa
              </h2>
              <Divider />
              <ul>
                {[
                  "Buccolini",
                  "Bucher Vaslin",
                  "Defranceschi",
                  "Della Toffola",
                  "Diemme",
                  "Pera",
                  "Siprem",
                  "Velo",
                  "Willmes",
                ].map((brand) => (
                  <li key={brand}>{brand}</li>
                ))}
                <li>
                  <strong>Otras a medida</strong>
                </li>
              </ul>
              <p>
                Además, ofrecemos <strong>Kits de reparación</strong>
              </p>
            </div>
            <div className="column-padding product-images">
              <Carousel slides={presses} kind="products" />
            </div>
          </div>
        </section>
        <section
          className="materials section-padding"
          aria-label="Calidad de las membranas"
        >
          <div className="container column-padding">
            <div className="certification">
              <p>
                Trabajamos con tela de calidad alimenticia aprobada y
                certificada por el Centro de Investigaciones Toxicológicas S.A.
              </p>
              <Image
                src={withBasePath(
                  "/images/cit-removebg-preview-e1663298242847.png",
                )}
                width={197}
                height={181}
                alt="Centro de Investigaciones Toxicológicas S.A."
                sizes="150px"
              />
            </div>
            <MaterialDiagram />
          </div>
        </section>
        <section
          className="services dark-section"
          aria-label="Soluciones para su producción"
        >
          <div className="container service-grid">
            <article className="service-card">
              <ServiceIcon type="check" />
              <h2>¿Quiere tener un stock listo para cualquier emergencia?</h2>
              <Divider />
              <p>¡Evite una parada en su producción!</p>
              <p>
                Abastezca su stock con la calidad y la tranquilidad de un
                producto confiable.
              </p>
              <p>
                Trabajamos todos los modelos de membranas para prensas del
                mercado.
              </p>
              <QuoteLink>Cotice mi modelo</QuoteLink>
            </article>
            <article className="service-card">
              <ServiceIcon type="alert" />
              <h2>¿Tiene una membrana dañada?</h2>
              <Divider />
              <p>
                Si su membrana tiene un pequeño corte o rajadura… No se preocupe
              </p>
              <p>
                <strong>¡Hay solución!</strong>
              </p>
              <p>
                Con un kit de reparación puede cubrir el área con rotura y
                continuar con su producción sin necesidad de reemplazar la
                membrana.
              </p>
              <QuoteLink>¡Quiero mi KIT!</QuoteLink>
            </article>
            <article className="service-card">
              <ServiceIcon type="question" />
              <h2>¿Le da temor acceder a repuestos no oficiales?</h2>
              <Divider />
              <p>
                No importa si el modelo de prensa está desactualizado y ya no
                consigue repuestos originales.
              </p>
              <p>
                Tomamos las dimensiones y fabricamos la membrana que usted
                necesita.
              </p>
              <QuoteLink>Preciso una membrana a la medida</QuoteLink>
            </article>
          </div>
        </section>
        <section
          className="clients section-padding"
          id="nuestros-clientes"
          aria-labelledby="clients-title"
        >
          <div className="container column-padding">
            <h2 className="heading-medium" id="clients-title">
              Nuestros clientes
            </h2>
            <Divider />
            <Accordion items={content.clients} variant="clients" id="clients" />
          </div>
        </section>
        <section className="testimonials" aria-labelledby="testimonial-title">
          <div className="container column-padding">
            <h2 id="testimonial-title" className="heading-default">
              Testimonios
            </h2>
            <Divider />
            <div className="testimonial-grid">
              <blockquote>
                <p>
                  “Acá en la empresa, desde que estoy en compras siempre le
                  hemos comprado a Fateplas y no hemos tenido ningún problema.
                </p>
                <p>
                  El resultado del prensado al utilizar la membrana es muy
                  bueno. Me gusta mucho la calidad de la membrana y el servicio
                  de atención.
                </p>
                <p>
                  Se lo recomiendo a todos los colegas de la división de
                  bodegas, a todos los que puedan llegar a hacer molienda de
                  vendimia”.
                </p>
                <footer>
                  <strong>Osvaldo Colilaf</strong>
                  <p>
                    Jefe en el Sector de compras y licitaciones de obras y
                    Servicios en RPB S.A. Cuyo
                  </p>
                </footer>
              </blockquote>
              <div className="testimonial-photo">
                <Image
                  src={withBasePath("/images/Osvaldo-Colilaff.jpg")}
                  width={500}
                  height={500}
                  alt="Osvaldo Colilaf"
                  sizes="(max-width: 767px) 300px, (max-width: 1024px) 140px, 275px"
                />
              </div>
            </div>
            <Divider className="testimonial-bottom-divider" />
          </div>
        </section>
        <section
          className="about"
          id="quienes-somos"
          aria-labelledby="about-title"
        >
          <div className="container about-panel">
            <div className="about-content">
              <h2 className="heading-default" id="about-title">
                ¿Quiénes somos?
              </h2>
              <Divider />
              <p>
                Somos una empresa familiar, de Mendoza, con trayectoria y
                experiencia en la industria de alimentos y bebidas.
              </p>
              <p>
                Sabemos lo que significa trabajar en un rubro donde la gestión
                del tiempo es fundamental.
              </p>
              <p>
                También entendemos cuáles son las necesidades del sector y los
                tiempos en que se opera.
              </p>
              <p>
                Por eso buscamos ser su solución disponible, comprometida y de
                calidad.
              </p>
              <p>
                Porque... si a <strong>usted le va bien</strong>, ¡a nosotros
                también!
              </p>
            </div>
          </div>
        </section>
        <section
          className="faq dark-section"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div className="container column-padding">
            <h2 className="heading-default" id="faq-title">
              Dudas frecuentes
            </h2>
            <Divider />
            <Accordion items={content.faq} variant="faq" id="faq" />
          </div>
        </section>
        <section
          className="benefits section-padding"
          aria-label="Ventajas de trabajar con Fateplas"
        >
          <div className="container two-columns">
            <div className="benefits-copy">
              <ul>
                <li>
                  <BenefitIcon type="tag" />
                  <span>
                    <strong>Ahorro en su compra</strong>, con precios pensados
                    para el mercado Latinoamericano.
                  </span>
                </li>
                <li>
                  <BenefitIcon type="shield" />
                  <span>
                    <strong>Seguridad en la compra</strong>, con profesional
                    capacitado y material de calidad alimenticia.
                  </span>
                </li>
                <li>
                  <BenefitIcon type="clock" />
                  <span>
                    <strong>Inmediatez en la fabricación</strong>.
                  </span>
                </li>
              </ul>
              <QuoteLink>¡Los quiero como proovedores!</QuoteLink>
            </div>
            <div className="benefits-logo column-padding">
              <Image
                src={withBasePath("/images/image14-300x81.png")}
                width={300}
                height={81}
                alt="Seguridad, rapidez y ahorro"
              />
            </div>
          </div>
        </section>
        <section
          className="contact section-padding"
          id="contacto"
          aria-labelledby="contact-title"
        >
          <div className="container two-columns">
            <div className="column-padding">
              <h2 className="heading-default" id="contact-title">
                Contáctenos
              </h2>
              <Divider />
              <ContactForm />
            </div>
            <div className="column-padding contact-details">
              <iframe
                src="https://maps.google.com/maps?q=-32.9246988%2C-68.8198041&t=m&z=15&output=embed&iwloc=near"
                title="Ubicación de Fateplas en Godoy Cruz, Mendoza"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p>Independencia 70 de Godoy Cruz, Mendoza, Argentina.</p>
              <Divider />
              <p>
                <strong>Teléfono:</strong>{" "}
                <a href="tel:+542615114420">+54 261 5114420</a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:fateplas@yahoo.com.ar">fateplas@yahoo.com.ar</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p>Todos los derechos reservados © {new Date().getFullYear()}</p>
        <p>
          <strong>Fateplas</strong> de <strong>Vosso S.A.</strong>
        </p>
      </footer>
    </>
  );
}
