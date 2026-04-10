import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { getGoogleLoginUrl, login } from "../../../api/auth";
import { useAuth } from "../../../auth/AuthContext";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, refreshSession, session } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const [form, setForm] = useState({
    email: readEmailFromSearch(location.search),
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oauthError = searchParams.get("oauthError");

  if (!loading && isAuthenticated) {
    return <Navigate to={session.profileSlug ? `/${session.profileSlug}` : "/profiles"} replace />;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      const message = caughtError instanceof Error ? caughtError.message : "Unable to sign in.";

      if (message === "Please verify your email before signing in.") {
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`, {
          replace: true,
          state: {
            message: "Please verify your email to continue.",
          },
        });
        return;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    window.location.assign(getGoogleLoginUrl());
  }

  return (
    <main className="auth-page auth-page--minimal">
      <MarketingNavbar />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-meta">Sign in with the email and password linked to your gallery account.</p>
              </div>

              {searchParams.get("verified") === "1" && (
                <p className="auth-success">Email verified. You can sign in now.</p>
              )}

              {(error ?? oauthError) && <p className="auth-error">{error ?? oauthError}</p>}

              <button className="auth-provider-btn" type="button" onClick={handleGoogleSignIn} disabled={submitting}>
                Continue with Google
              </button>

              <div className="auth-divider">or continue with email</div>

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
