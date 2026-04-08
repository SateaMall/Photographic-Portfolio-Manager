import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { resendVerificationCode, verifyEmail } from "../../api/auth";
import "./AuthPages.css";

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const signupMessage = useMemo(() => {
    if (typeof location.state === "object" && location.state && "signupMessage" in location.state) {
      const value = location.state.signupMessage;
      return typeof value === "string" ? value : null;
    }

    return null;
  }, [location.state]);
  const [form, setForm] = useState({
    email: readEmailFromSearch(location.search),
    code: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(signupMessage);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await verifyEmail({
        email: form.email.trim(),
        code: form.code.trim(),
      });

      setSuccess(response.message);
      navigate(`/login?verified=1&email=${encodeURIComponent(form.email.trim())}`, { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to verify this email.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setSuccess(null);
    setResending(true);

    try {
      await resendVerificationCode(form.email.trim());
      setMessage("A fresh verification code was sent.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to resend the verification code.");
    } finally {
      setResending(false);
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
            <Link className="auth-link" to="/signup">
              Create account
            </Link>
            <Link className="auth-link" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <div className="auth-grid">
          <section className="auth-panel auth-panel--accent">
            <p className="auth-eyebrow">Email Verification</p>
            <h1 className="auth-title">Confirm ownership before publishing further.</h1>
            <p className="auth-copy">
              Enter the six-digit code sent to your inbox. Once verified, you can sign in and continue building your gallery.
            </p>
            <ul className="auth-list">
              <li>Verification activates the account created during signup.</li>
              <li>You can request another code if the first email did not arrive.</li>
              <li>After verification, head straight to sign in.</li>
            </ul>
          </section>

          <section className="auth-panel">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <p className="auth-eyebrow">Verify Account</p>
                <h2 className="auth-title">Enter your code</h2>
                <p className="auth-meta">The backend expects a six-digit verification code tied to your email address.</p>
              </div>

              {message && <p className="auth-message">{message}</p>}
              {success && <p className="auth-success">{success}</p>}
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
                <span className="auth-label">Verification code</span>
                <input
                  className="auth-input"
                  type="text"
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                />
              </label>

              <div className="auth-actions">
                <button className="auth-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Verifying..." : "Verify email"}
                </button>
              </div>

              <div className="auth-secondary-actions">
                <button
                  className="auth-ghost-btn"
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !form.email.trim()}
                >
                  {resending ? "Resending..." : "Resend code"}
                </button>
                <Link className="auth-inline-link" to="/login">
                  Back to sign in
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
