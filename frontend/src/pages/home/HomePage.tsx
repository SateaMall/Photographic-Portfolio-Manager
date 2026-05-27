import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { ScrollIndicator } from "../../components/indicator/ScrollIndicator";
import { ScrollToHash } from "../../layouts/components/ScrollToHash";
import { ScrollToTop } from "../../layouts/components/ScrollToTop";
import { buildSiteMetadata, usePageMetadata } from "../../seo/usePageMetadata";
import { MarketingNavbar } from "./components/navigation/MarketingNavbar";
import "./HomePage.css";

const homeHeroStyle: CSSProperties & Record<"--home-hero-media", string> = {
  "--home-hero-media": 'url("/homepage-bg.webp")',
};

export default function HomePage() {
  const { isAuthenticated, loading, session } = useAuth();
  const primaryTarget = !loading && isAuthenticated
    ? (session.profileSlug ? `/${session.profileSlug}` : "/")
    : "/signup";

  const actionLabel = isAuthenticated ? "Open gallery" : "Start the journey";

  usePageMetadata(buildSiteMetadata());

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-home-reveal]"));

    if (sections.length === 0) {
      return;
    }

    const revealSection = (section: HTMLElement) => {
      section.classList.add("is-visible");
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || !("IntersectionObserver" in window)
    ) {
      sections.forEach(revealSection);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          revealSection(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="home-page">
      <ScrollToTop />
      <ScrollToHash />
      <MarketingNavbar overlay />

      <section className="home-hero" style={homeHeroStyle}>
        <div className="home-hero__content">
          <p className="home-hero__eyebrow"> Portofolios made especially for photographers </p>
          <h1 className="home-hero__title">Let us help you share what matters to you.</h1>
          <p className="home-hero__subtitle">
            Prepare your photography portfolio in 5 minutes.
          </p>
          <Link className="home-hero__cta" to={primaryTarget}>
            {actionLabel}
          </Link>
        </div>
        <div className="scroll-indicator-home">
          <ScrollIndicator targetId={["about"]} />
        </div>
      </section>

      <section className="home-section" id="about" data-home-reveal>
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Elegant & Engaging</p>
            <h2 className="home-section__title">A refined gallery experience that invites interaction</h2>
          </div>

          <div className="home-section__copy">
            <img
              className="home-section__image"
              src="/elegant.png"
              alt="Gallery preview displayed on a tablet"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="home-section home-section--muted" data-home-reveal>
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Cross-Device Experience</p>
            <h2 className="home-section__title"> A seamless experience adapted on all screens</h2>
          </div>
          <div className="home-section__copy">
            <img
              className="home-section__image"
              src="/cross-device.png"
              alt="Responsive website preview across devices"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="home-section home-section--muted" data-home-reveal>
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Customizable</p>
            <h2 className="home-section__title">Designed to match your artistic identity </h2>
          </div>

          <div className="home-section__copy">
            <img
              className="home-section__image"
              src="/studio.png"
              alt="Studio customization view"
              loading="lazy"
            />
          </div>
        </div>
      </section>
            <section className="home-section home-section--muted" data-home-reveal>
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Analytics</p>
            <h2 className="home-section__title">See how your portfolio performs over time</h2>
          </div>

          <div className="home-section__copy">
            <img
              className="home-section__image"
              src="/statistics.png"
              alt="Analytics dashboard view"
              loading="lazy"
            />
          </div>
        </div>
      </section>


      <section className="home-section home-section--muted" data-home-reveal>
        <div className="home-section__inner home-section__inner--cta">
          <p className="home-section__label">Create your portfolio</p>
          <h2 className="home-section__title">Ready to share your work?</h2>
          <p className="home-section__subtitle">
            Start building your gallery now, or look through the exemple.
          </p>
          <div className="home-section__actions">
            <Link className="home-section__button home-section__button--primary" to="/signup">
              Sign up
            </Link>
            <Link className="home-section__button home-section__button--secondary" to="/satea-almallouhi">
              Example
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 Let Me Lens. All rights reserved.</p>
        <p>Empowering photographers to share what matters to them</p>
        <p>
          <a className="home-footer__link" href="mailto:support@letmelens.com">
            support@letmelens.com
          </a>
        </p>
        <p>
          <Link className="home-footer__link" to="/privacy">
            Privacy Notice
          </Link>
        </p>
      </footer>
    </main>
  );
}
