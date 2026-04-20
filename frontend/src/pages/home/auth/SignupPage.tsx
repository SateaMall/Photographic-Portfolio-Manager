import { useState, type CSSProperties, type SubmitEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { getGoogleLoginUrl, signup } from "../../../api/auth";
import { useAuth } from "../../../auth/AuthContext";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

const signupPageStyle: CSSProperties & Record<"--auth-page-media", string> = {
  "--auth-page-media": 'url("/signup-bg.webp")',
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
                  Let us give you the tool to expose your work!
                </p>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <button className="auth-provider-btn" type="button" onClick={handleGoogleSignIn} disabled={submitting}>
                <svg className="auth-provider-btn__icon" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.715v2.2582h2.9086c1.7027-1.5673 2.6836-3.8741 2.6836-6.6145z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1805l-2.9086-2.2582c-.8064.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7091H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
                  <path fill="#FBBC05" d="M3.9636 10.7109C3.7832 10.1705 3.6818 9.5932 3.6818 9c0-.5932.1014-1.1705.2818-1.7109V4.9573H.9573C.3477 6.1727 0 7.5482 0 9c0 1.4518.3477 2.8273.9573 4.0427l3.0063-2.3318z" />
                  <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4423 1.3455l2.5813-2.5814C13.4632.8918 11.4264 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9573l3.0063 2.3318C4.6718 5.1623 6.6559 3.5795 9 3.5795z" />
                </svg>
                <span>Continue with Google</span>
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
