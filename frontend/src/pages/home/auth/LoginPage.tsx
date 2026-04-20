import { useState, type CSSProperties, type SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { getGoogleLoginUrl, login } from "../../../api/auth";
import { useAuth } from "../../../auth/AuthContext";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";
  

const loginPageStyle: CSSProperties & Record<"--auth-page-media", string> = {
  "--auth-page-media": `url("${encodeURI("/login-bg.webp")}")`,
};

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

function readRedirectTarget(state: unknown) {
  if (
    state &&
    typeof state === "object" &&
    "from" in state &&
    typeof (state as { from: unknown }).from === "string"
  ) {
    const target = (state as { from: string }).from;
    return target.startsWith("/") ? target : null;
  }

  return null;
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, refreshSession, session } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = readRedirectTarget(location.state);
  const [form, setForm] = useState({
    email: readEmailFromSearch(location.search),
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oauthError = searchParams.get("oauthError");

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTarget ?? (session.profileSlug ? `/${session.profileSlug}` : "/profiles")} replace />;
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
      navigate(redirectTarget ?? (nextSession.profileSlug ? `/${nextSession.profileSlug}` : "/profiles"), { replace: true });
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
    <main className="auth-page auth-page--minimal" style={loginPageStyle}>
      <MarketingNavbar overlay />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Welcome back</h2>
              </div>

              {searchParams.get("verified") === "1" && (
                <p className="auth-success">Email verified. You can sign in now.</p>
              )}

              {(error ?? oauthError) && <p className="auth-error">{error ?? oauthError}</p>}

              <button className="auth-provider-btn" type="button" onClick={handleGoogleSignIn} disabled={submitting}>
                <svg className="auth-provider-btn__icon" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.715v2.2582h2.9086c1.7027-1.5673 2.6836-3.8741 2.6836-6.6145z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1805l-2.9086-2.2582c-.8064.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7091H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
                  <path fill="#FBBC05" d="M3.9636 10.7109C3.7832 10.1705 3.6818 9.5932 3.6818 9c0-.5932.1014-1.1705.2818-1.7109V4.9573H.9573C.3477 6.1727 0 7.5482 0 9c0 1.4518.3477 2.8273.9573 4.0427l3.0063-2.3318z" />
                  <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4423 1.3455l2.5813-2.5814C13.4632.8918 11.4264 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9573l3.0063 2.3318C4.6718 5.1623 6.6559 3.5795 9 3.5795z" />
                </svg>
                <span>Continue with Google</span>
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
