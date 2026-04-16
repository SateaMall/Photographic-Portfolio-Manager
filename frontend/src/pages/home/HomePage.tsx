import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { MarketingNavbar } from "./components/navigation/MarketingNavbar";
import "./HomePage.css";

const homeHeroStyle: CSSProperties & Record<"--home-hero-media", string> = {
  "--home-hero-media": 'url("/Une_foule_vers_le_ciel.jpg")',
};

export default function HomePage() {
  const { isAuthenticated, loading, session } = useAuth();
  const primaryTarget = !loading && isAuthenticated
    ? (session.profileSlug ? `/${session.profileSlug}` : "/profiles")
    : "/signup";

  return (
    <main className="home-page">
      <MarketingNavbar overlay />

      <section className="home-hero" style={homeHeroStyle}>
        <div className="home-hero__content">
          <p className="home-hero__eyebrow"> Portofolios made especially for photographers </p>
          <h1 className="home-hero__title">Let us help you share what matters to you.</h1>
          <p className="home-hero__subtitle">
            Prepare your photography portfolio in 5 minutes.
          </p>
          <Link className="home-hero__cta" to={primaryTarget}>
            Start the journey
          </Link>
        </div>
      </section>

      <section className="home-section " id="about">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label ">About Us</p>
            <h2 className="home-section__title">A portofolio built for photographers needs</h2>
          </div>
        
          <p className="home-section__copy">
            This version keeps the first impression minimal, with a full-screen hero and quiet navigation so you can swap in a single photograph or a slideshow later without changing the structure.
          </p>
        </div>
      </section>
      <section className="home-section home-section--muted" id="contact">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Contact Us</p>
            <h2 className="home-section__title">Elegant theme to showcase your work</h2>
          </div>
          <p className="home-section__copy">
            You can place contact details, a short studio introduction, or a booking call to action here later. For now, the layout stays intentionally light.
          </p>
        </div>
      </section>
      <section className="home-section home-section--muted" id="contact">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Contact Us</p>
            <h2 className="home-section__title">Easy-to-use interface to make the initial steps seamless.</h2>
          </div>
          <p className="home-section__copy">
            You can place contact details, a short studio introduction, or a booking call to action here later. For now, the layout stays intentionally light.
          </p>
        </div>
      </section>
      
    </main>
  );
}
