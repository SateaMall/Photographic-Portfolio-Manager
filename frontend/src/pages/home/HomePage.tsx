import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { MarketingNavbar } from "./components/navigation/MarketingNavbar";
import "./HomePage.css";

export default function HomePage() {
  const { isAuthenticated, loading, session } = useAuth();
  const primaryTarget = !loading && isAuthenticated
    ? (session.profileSlug ? `/${session.profileSlug}` : "/profiles")
    : "/signup";

  return (
    <main className="home-page">
      <MarketingNavbar overlay />

      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Prepare your photography portfolio in 5 minutes.</p>
          <h1 className="home-hero__title">A calm first screen built for the photograph you will choose later.</h1>
          <p className="home-hero__subtitle">
            Start with a full-screen image, keep the interface quiet, and let the work speak first.
          </p>
          <Link className="home-hero__cta" to={primaryTarget}>
            Start the journey
          </Link>
        </div>
      </section>

      <section className="home-section" id="about">
        <div className="home-section__inner">
          <p className="home-section__label">About Us</p>
          <h2 className="home-section__title">The homepage now starts with the image instead of the interface.</h2>
          <p className="home-section__copy">
            This version keeps the first impression minimal, with a full-screen hero and quiet navigation so you can swap in a single photograph or a slideshow later without changing the structure.
          </p>
        </div>
      </section>

      <section className="home-section home-section--muted" id="contact">
        <div className="home-section__inner home-section__inner--split">
          <div>
            <p className="home-section__label">Contact Us</p>
            <h2 className="home-section__title">The white section after the hero is ready for your next content decisions.</h2>
          </div>
          <p className="home-section__copy">
            You can place contact details, a short studio introduction, or a booking call to action here later. For now, the layout stays intentionally light.
          </p>
        </div>
      </section>
    </main>
  );
}
