import { useState, type CSSProperties, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { getGoogleLoginUrl, signup } from "../../../api/auth";
import { useAuth } from "../../../auth/AuthContext";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

const signupPageStyle: CSSProperties & Record<"--auth-page-media", string> = {
  "--auth-page-media": 'url("/Ready5_265592.JPG")',
};

function isStepOneValid(email: string, password: string) {
  return email.trim().length > 0 && password.length >= 8;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, session } = useAuth();
  const [step, setStep] = useState(1);
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

  if (!loading && isAuthenticated && session.profileSlug) {
    return <Navigate to={`/${session.profileSlug}`} replace />;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (step === 1) {
      if (!isStepOneValid(form.email, form.password)) {
        setError("Enter a valid email and a password with at least 8 characters.");
        return;
      }

      setStep(2);
      return;
    }

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

  function handleGoogleSignIn() {
    window.location.assign(getGoogleLoginUrl());
  }

  return (
    <main className="auth-page auth-page--minimal" style={signupPageStyle}>
      <MarketingNavbar overlay />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal auth-panel--signup">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Create account</h2>
                <p className="auth-meta">
                  Create your photographic portofolio with Let me Lens and share your work with the world.
                </p>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <button className="auth-provider-btn" type="button" onClick={handleGoogleSignIn} disabled={submitting}>
                Continue with Google
              </button>

              <div className="auth-divider">or sign up with email</div>

              {step === 1 ? (
                <>
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
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>

                  <div className="auth-actions">
                    <button
                      className="auth-primary-btn"
                      type="button"
                      onClick={() => {
                        setError(null);
                        setMessage(null);
                        setStep(2);
                      }}
                      disabled={!isStepOneValid(form.email, form.password)}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
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

                  <div className="auth-actions">
                    <button
                      className="auth-secondary-btn"
                      type="button"
                      onClick={() => {
                        setError(null);
                        setMessage(null);
                        setStep(1);
                      }}
                      disabled={submitting}
                    >
                      Back
                    </button>
                    <button className="auth-primary-btn" type="submit" disabled={submitting}>
                      {submitting ? "Creating account..." : "Create account"}
                    </button>
                  </div>
                </>
              )}

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
