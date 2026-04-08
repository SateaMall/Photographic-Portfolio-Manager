import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import "./HomePage.css";

const HOME_FEATURES = [
  {
    title: "Public galleries",
    copy: "Keep the work front and center with pages designed for browsing, albums, and direct sharing.",
  },
  {
    title: "Private ownership",
    copy: "Sign in with a verified account so the right photographer stays in control of the profile and its edits.",
  },
  {
    title: "Portfolio momentum",
    copy: "Move from signup to a live public space quickly, then refine sequencing, storytelling, and contact details over time.",
  },
];

export default function HomePage() {
  const { error, isAuthenticated, loading, session, signOut } = useAuth();

  return (
    <main className="home-page">
      <section className="home-hero">
        <header className="home-nav">
          <Link className="home-brand" to="/">
            Photo Gallery
          </Link>

          <nav className="home-nav-links" aria-label="Primary">
            <a className="home-nav-link" href="#features">
              Features
            </a>
            <Link className="auth-link" to="/satea">
              Exemple
            </Link>
            {isAuthenticated ? (
              <button className="home-nav-button" type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            ) : (
              <>
                <Link className="home-nav-link" to="/login">
                  Sign in
                </Link>
                <Link className="home-nav-cta" to="/signup">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </header>

        <div className="home-hero-body">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Portfolio Platform</p>
            <h1 className="home-title">Build a public photography portofolio.</h1>

            <div className="home-actions">
              {isAuthenticated ? (
                <>
                  <Link className="home-primary-btn" to={session.profileSlug ? `/${session.profileSlug}` : "/profiles"}>
                    Open your gallery
                  </Link>
                  <Link className="home-secondary-btn" to="/profiles">
                    Browse public profiles
                  </Link>
                </>
              ) : (
                <>
                  <Link className="home-primary-btn" to="/signup">
                    Start with signup
                  </Link>
                  <Link className="home-secondary-btn" to="/login">
                    I already have an account
                  </Link>
                </>
              )}
            </div>

            <div className="home-status-row">
              <article className="home-status-card">
                <span className="home-status-label">Session</span>
                <strong>{loading ? "Checking current login" : isAuthenticated ? "Authenticated" : "Not signed in"}</strong>
              </article>
              <article className="home-status-card">
                <span className="home-status-label">Profile</span>
                <strong>{session.displayName ?? session.email ?? "Create or sign in to continue"}</strong>
              </article>
            </div>

            {error && <p className="home-error">Session check failed: {error}</p>}
          </div>

          <aside className="home-hero-panel">
            <p className="home-panel-kicker">What ships with this setup</p>
            <div className="home-panel-list">
              <div className="home-panel-item">
                <span className="home-panel-step">01</span>
                <div>
                  <h2>Dedicated homepage</h2>
                  <p>A real landing route at `/` instead of an automatic redirect.</p>
                </div>
              </div>
              <div className="home-panel-item">
                <span className="home-panel-step">02</span>
                <div>
                  <h2>End-to-end auth</h2>
                  <p>Signup, verification, sign-in, session refresh, and sign-out are connected to the Spring backend.</p>
                </div>
              </div>
              <div className="home-panel-item">
                <span className="home-panel-step">03</span>
                <div>
                  <h2>Session-aware UI</h2>
                  <p>The landing page adapts based on whether the current visitor already has an authenticated session.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-section" id="features">
        <div className="home-section-head">
          <p className="home-eyebrow">Features</p>
          <h2>Built for photographers who need both a portfolio surface and simple account ownership.</h2>
        </div>

        <div className="home-feature-grid">
          {HOME_FEATURES.map((feature) => (
            <article className="home-feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>


      <section className="home-cta-strip">
        <div>
          <p className="home-eyebrow">Next Step</p>
          <h2>{isAuthenticated ? "Continue refining your public gallery." : "Create the account that will own your gallery."}</h2>
        </div>

        <div className="home-actions home-actions--compact">
          <Link className="home-primary-btn" to={isAuthenticated && session.profileSlug ? `/${session.profileSlug}` : "/signup"}>
            {isAuthenticated ? "Go to your gallery" : "Create account"}
          </Link>
          <Link className="home-secondary-btn" to="/satea">
            Exemple
          </Link>
        </div>
      </section>
    </main>
  );
}
