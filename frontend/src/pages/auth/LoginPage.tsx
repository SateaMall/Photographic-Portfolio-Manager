import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { login } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import "./AuthPages.css";

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, refreshSession, session } = useAuth();
  const [form, setForm] = useState({
    email: readEmailFromSearch(location.search),
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Navigate to={session.profileSlug ? `/${session.profileSlug}` : "/profiles"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      const nextSession = await refreshSession();
      navigate(nextSession.profileSlug ? `/${nextSession.profileSlug}` : "/profiles", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-topbar">
          <Link className="auth-brand" to="/">
            Photo Gallery
          </Link>
          <div className="auth-topbar-links">
            <Link className="auth-link" to="/profiles">
              Explore galleries
            </Link>
            <Link className="auth-link" to="/signup">
              Create account
            </Link>
          </div>
        </div>

        <div className="auth-grid">
          <section className="auth-panel auth-panel--accent">
            <p className="auth-eyebrow">Sign In</p>
            <h1 className="auth-title">Return to your photography space.</h1>
            <p className="auth-copy">
              Sign in to manage your gallery, keep your portfolio current, and share the work you want people to remember.
            </p>
            <ul className="auth-list">
              <li>Upload and organize new work.</li>
              <li>Keep albums, profile details, and contact links in sync.</li>
              <li>Jump back into your public gallery in one click.</li>
            </ul>
          </section>

          <section className="auth-panel">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <p className="auth-eyebrow">Account Access</p>
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-meta">Use the email and password linked to your gallery account.</p>
              </div>

              {new URLSearchParams(location.search).get("verified") === "1" && (
                <p className="auth-success">Email verified. You can sign in now.</p>
              )}

              {error && <p className="auth-error">{error}</p>}

              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </label>

              <div className="auth-actions">
                <button className="auth-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
                <Link className="auth-inline-link" to="/verify-email">
                  Verify your email
                </Link>
              </div>

              <p className="auth-hint">
                Need an account? <Link className="auth-inline-link" to="/signup">Create one</Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
