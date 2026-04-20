import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { MarketingNavbar } from "./components/navigation/MarketingNavbar";
import "./HomePage.css";
import { ScrollIndicator } from "../../components/indicator/ScrollIndicator";

import { ScrollToHash } from "../../layouts/components/ScrollToHash";
const homeHeroStyle: CSSProperties & Record<"--home-hero-media", string> = {
  "--home-hero-media": 'url("/homepage-bg.webp")',
};

export default function HomePage() {
  const { isAuthenticated, loading, session } = useAuth();
  const primaryTarget = !loading && isAuthenticated
    ? (session.profileSlug ? `/${session.profileSlug}` : "/profiles")
    : "/signup";

  const actionLabel = isAuthenticated ? "Open gallery" : "Start the journey";

  return (
    <main className="home-page">
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
        <div className="scroll-indicator">
                <ScrollIndicator targetId={["about"]} />
        </div> 
      </section>

      <section className="home-section " id="about">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label ">Photographers</p>
            <h2 className="home-section__title">A portofolio built for photographers</h2>
          </div>
        
          <p className="home-section__copy">
            We understand photographers' needs and have crafted a platform that gives you the possibility to create a portofolio with a tools that you truly need.
          </p>
        </div>
      </section>
      <section className="home-section home-section--muted">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Elegant & Engaging</p>
            <h2 className="home-section__title">Elegant theme to showcase your work</h2>
          </div>
          <p className="home-section__copy">
            The theme is designed to engage your visitors with an intuitive and elegant layout that puts your photos in the spotlight. Let your visitors enjoy a seamless browsing experience across all devices, allowing your audience to fully appreciate your work.
          </p>
        </div>
      </section>
            <section className="home-section home-section--muted">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Adapted to all screens</p>
            <h2 className="home-section__title">Your portofolio, adapted to all screens</h2>
          </div>
          <p className="home-section__copy">
            Let your visitors enjoy a seamless browsing experience across all devices, allowing your audience to fully appreciate your work.
          </p>
        </div>
       </section>
       
       <footer className="home-footer">
         <p>© 2026 Let Me Lens. All rights reserved.</p>
         <p>Empowering photographers to share what matters to them</p>
         <p>support@letmelens.com</p>
       </footer>
     </main>
  );
}
