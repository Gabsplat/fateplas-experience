import { withBasePath } from "@/lib/base-path";
import Image from "next/image";
import Header from "@/components/Header";
import HeroMedia from "@/components/HeroMedia";
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
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="container hero-container">
            <div className="hero-copy">
              <h1 id="hero-title">
                Seguridad, calidad y precio en cada membrana.
              </h1>
              <p>
                Membranas para prensas neumáticas e hidroneumáticas, fabricadas
                a medida.
              </p>
              <div className="hero-actions">
                <QuoteLink>Solicitar una cotización</QuoteLink>
                <a className="text-link" href="#nuestros-productos">
                  Conocer los productos
                </a>
              </div>
            </div>
            <div className="hero-media">
              <HeroMedia />
            </div>
          </div>
        </section>
        <section className="trusted" aria-labelledby="trusted-title">
          <div className="container">
            <h2 id="trusted-title">Confían en nosotros</h2>
            <Carousel slides={logos} kind="logos" />
          </div>
        </section>
        <section
          className="introduction section-padding"
          aria-labelledby="intro-title"
        >
          <div className="container introduction-grid">
            <div className="introduction-image">
              <Image
                unoptimized
                src={withBasePath(
                  "/images/jim-harris-zDlusnb3G3Q-unsplash-scaled.jpg",
                )}
                width={2560}
                height={1920}
                alt="Barricas en una bodega"
                sizes="(max-width: 768px) 100vw, 48vw"
              />
            </div>
            <div className="introduction-copy">
              <h2 id="intro-title">
                Su producción necesita un proveedor de confianza.
              </h2>
              <p>
                La clave para adquirir una ventaja competitiva está en respaldar
                su producción con la seguridad de un buen proveedor.
              </p>
              <p>
                Complete su stock de repuestos de membranas. Incorpore un
                proveedor de confianza que sepa responder a tiempo.
              </p>
              <a className="text-link" href="#quienes-somos">
                Conozca Fateplas
              </a>
            </div>
          </div>
        </section>
        <section
          className="products section-padding"
          id="nuestros-productos"
          aria-labelledby="products-title"
        >
          <div className="container">
            <div className="section-heading products-heading">
              <h2 id="products-title">La membrana que su prensa necesita.</h2>
              <p>
                Repuestos para los modelos del mercado y fabricación a medida.
              </p>
            </div>
            <div className="products-grid">
              <div className="products-copy">
                <h3>Membranas para prensa</h3>
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
                <div className="product-repair">
                  <h3>Kits de reparación</h3>
                  <p>Para pequeños cortes o rajaduras en su membrana.</p>
                </div>
                <QuoteLink>Cotizar mi modelo</QuoteLink>
              </div>
              <div className="product-images">
                <Carousel slides={presses} kind="products" />
              </div>
            </div>
          </div>
        </section>
        <section
          className="materials section-padding"
          aria-labelledby="materials-title"
        >
          <div className="container">
            <div className="section-heading materials-heading">
              <h2 id="materials-title">Calidad en cada capa.</h2>
              <p>Conozca la composición de nuestras membranas.</p>
            </div>
            <MaterialDiagram />
            <div className="certification">
              <Image
                src={withBasePath(
                  "/images/cit-removebg-preview-e1663298242847.png",
                )}
                width={197}
                height={181}
                alt="Centro de Investigaciones Toxicológicas S.A."
                sizes="100px"
              />
              <p>
                Trabajamos con tela de calidad alimenticia aprobada y
                certificada por el Centro de Investigaciones Toxicológicas S.A.
              </p>
            </div>
          </div>
        </section>
        <section
          className="services section-padding"
          aria-labelledby="services-title"
        >
          <div className="container">
            <div className="section-heading">
              <h2 id="services-title">Para que su producción continúe.</h2>
            </div>
            <div className="service-grid">
              <article className="service-card">
                <ServiceIcon type="check" />
                <h3>Un stock listo para las emergencias</h3>
                <p>
                  Evite una parada en su producción. Abastezca su stock con la
                  calidad y la tranquilidad de un producto confiable.
                </p>
                <p>
                  Trabajamos todos los modelos de membranas para prensas del
                  mercado.
                </p>
                <QuoteLink>Cotizar mi modelo</QuoteLink>
              </article>
              <article className="service-card">
                <ServiceIcon type="alert" />
                <h3>Solución para una membrana dañada</h3>
                <p>
                  Si su membrana tiene un pequeño corte o rajadura, hay
                  solución.
                </p>
                <p>
                  Con un kit de reparación puede cubrir el área con rotura y
                  continuar con su producción sin necesidad de reemplazar la
                  membrana.
                </p>
                <QuoteLink>Consultar por un kit</QuoteLink>
              </article>
              <article className="service-card">
                <ServiceIcon type="question" />
                <h3>Repuestos fabricados a medida</h3>
                <p>
                  No importa si el modelo de prensa está desactualizado y ya no
                  consigue repuestos originales.
                </p>
                <p>
                  Tomamos las dimensiones y fabricamos la membrana que usted
                  necesita.
                </p>
                <QuoteLink>Solicitar una membrana</QuoteLink>
              </article>
            </div>
          </div>
        </section>
        <section
          className="clients section-padding"
          id="nuestros-clientes"
          aria-labelledby="clients-title"
        >
          <div className="container information-grid">
            <div className="section-heading">
              <h2 id="clients-title">Nuestros clientes</h2>
              <p>Empresas que respaldan su producción con Fateplas.</p>
            </div>
            <Accordion items={content.clients} variant="clients" id="clients" />
          </div>
        </section>
        <section
          className="testimonials section-padding"
          aria-labelledby="testimonial-title"
        >
          <div className="container testimonial-grid">
            <div className="testimonial-photo">
              <Image
                src={withBasePath("/images/Osvaldo-Colilaff.jpg")}
                width={500}
                height={500}
                alt="Osvaldo Colilaf"
                sizes="(max-width: 768px) 160px, 320px"
              />
              <h2 id="testimonial-title">
                La experiencia de nuestros clientes
              </h2>
            </div>
            <blockquote>
              <p className="testimonial-lead">
                “El resultado del prensado al utilizar la membrana es muy
                bueno.”
              </p>
              <p>
                Acá en la empresa, desde que estoy en compras siempre le hemos
                comprado a Fateplas y no hemos tenido ningún problema.
              </p>
              <p>
                Me gusta mucho la calidad de la membrana y el servicio de
                atención. Se lo recomiendo a todos los colegas de la división de
                bodegas, a todos los que puedan llegar a hacer molienda de
                vendimia.
              </p>
              <footer>
                <strong>Osvaldo Colilaf</strong>
                <p>
                  Jefe en el Sector de compras y licitaciones de obras y
                  Servicios en RPB S.A. Cuyo
                </p>
              </footer>
            </blockquote>
          </div>
        </section>
        <section
          className="about"
          id="quienes-somos"
          aria-labelledby="about-title"
        >
          <div className="about-panel">
            <div className="about-content">
              <h2 id="about-title">De Mendoza, para su industria.</h2>
              <p>
                Somos una empresa familiar, con trayectoria y experiencia en la
                industria de alimentos y bebidas.
              </p>
              <p>
                Sabemos lo que significa trabajar en un rubro donde la gestión
                del tiempo es fundamental. Entendemos las necesidades del sector
                y los tiempos en que se opera.
              </p>
              <p>
                Por eso buscamos ser su solución disponible, comprometida y de
                calidad.
              </p>
              <p className="about-closing">
                Si a usted le va bien, a nosotros también.
              </p>
            </div>
            <div className="about-image">
              <Image
                src={withBasePath(
                  "/images/simon-tartarotti-qcJUzFKLhF8-unsplash-scaled.jpg",
                )}
                width={2560}
                height={1707}
                alt="Hileras de viñedos"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
        <section
          className="faq section-padding"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div className="container information-grid">
            <div className="section-heading">
              <h2 id="faq-title">Dudas frecuentes</h2>
              <p>
                Respuestas sobre nuestras membranas, su cuidado y reparación.
              </p>
            </div>
            <Accordion items={content.faq} variant="faq" id="faq" />
          </div>
        </section>
        <section
          className="benefits section-padding"
          aria-labelledby="benefits-title"
        >
          <div className="container benefits-grid">
            <div className="benefits-heading">
              <h2 id="benefits-title">Seguridad, rapidez y ahorro.</h2>
              <Image
                src={withBasePath("/images/image14-300x81.png")}
                width={300}
                height={81}
                alt="Seguridad, rapidez y ahorro"
                sizes="240px"
              />
            </div>
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
                    <strong>Inmediatez en la fabricación.</strong>
                  </span>
                </li>
              </ul>
              <QuoteLink>Consultar por mi repuesto</QuoteLink>
            </div>
          </div>
        </section>
        <section
          className="contact section-padding"
          id="contacto"
          aria-labelledby="contact-title"
        >
          <div className="container">
            <div className="section-heading contact-heading">
              <h2 id="contact-title">Hablemos de su próxima membrana.</h2>
              <p>Cuéntenos qué necesita. Estamos para asesorarlo.</p>
            </div>
            <div className="contact-grid">
              <ContactForm />
              <div className="contact-details">
                <div className="contact-direct">
                  <a href="tel:+542615114420">+54 261 5114420</a>
                  <a href="mailto:fateplas@yahoo.com.ar">
                    fateplas@yahoo.com.ar
                  </a>
                </div>
                <iframe
                  src="https://maps.google.com/maps?q=-32.9246988%2C-68.8198041&t=m&z=15&output=embed&iwloc=near"
                  title="Ubicación de Fateplas en Godoy Cruz, Mendoza"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p>
                  Independencia 70 de Godoy Cruz,
                  <br />
                  Mendoza, Argentina.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <a href="#inicio" aria-label="Fateplas, volver al inicio">
            <Image
              src={withBasePath(
                "/images/Logo3DFrente6-removebg-preview-1-e1662416470451-240x43.png",
              )}
              width={240}
              height={43}
              alt="Fateplas"
              sizes="180px"
            />
          </a>
          <p>Fateplas de Vosso S.A.</p>
          <p>Todos los derechos reservados © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}
