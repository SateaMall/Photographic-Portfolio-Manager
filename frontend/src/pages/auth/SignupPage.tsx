import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { signup } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import "./AuthPages.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, session } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Navigate to={session.profileSlug ? `/${session.profileSlug}` : "/profiles"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await signup({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });

      setMessage(response.message);
      navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`, {
        replace: true,
        state: { signupMessage: response.message },
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create your account.");
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
            <Link className="auth-link" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <div className="auth-grid">
          <section className="auth-panel auth-panel--accent">
            <p className="auth-eyebrow">Create Account</p>
            <h1 className="auth-title">Launch a public home for your work.</h1>
            <p className="auth-copy">
              Create your account, claim your gallery slug, and start shaping a portfolio that is easy to browse and easy to share.
            </p>
            <ul className="auth-list">
              <li>Your account creates a public profile and gallery space.</li>
              <li>Email verification keeps account ownership clear and secure.</li>
              <li>You can start with the basics and refine your portfolio later.</li>
            </ul>
          </section>

          <section className="auth-panel">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <p className="auth-eyebrow">New Photographer</p>
                <h2 className="auth-title">Create your account</h2>
                <p className="auth-meta">Use the same email you want visitors and collaborators to associate with your work.</p>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <div className="auth-row">
                <label className="auth-field">
                  <span className="auth-label">First name</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={form.firstName}
                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                    autoComplete="given-name"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label">Last name</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={form.lastName}
                    onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>

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

              <div className="auth-row">
                <label className="auth-field">
                  <span className="auth-label">Password</span>
                  <input
                    className="auth-input"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label">Confirm password</span>
                  <input
                    className="auth-input"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              </div>

              <div className="auth-actions">
                <button className="auth-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Creating account..." : "Create account"}
                </button>
                <Link className="auth-inline-link" to="/verify-email">
                  Already have a code?
                </Link>
              </div>

              <p className="auth-hint">
                Already registered? <Link className="auth-inline-link" to="/login">Sign in</Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
