import { useMemo, useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { resendVerificationCode, verifyEmail } from "../../../api/auth";
import { useAuth } from "../../../auth/AuthContext";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageMessage = useMemo(() => {
    if (typeof location.state !== "object" || !location.state) {
      return null;
    }

    if ("signupMessage" in location.state) {
      const value = location.state.signupMessage;
      return typeof value === "string" ? value : null;
    }

    if ("message" in location.state) {
      const value = location.state.message;
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
  const [message, setMessage] = useState<string | null>(pageMessage);
  const [success, setSuccess] = useState<string | null>(null);
  const { refreshSession } = useAuth();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      const session = await refreshSession();
      navigate(session.authenticated ? (session.profileSlug ? `/${session.profileSlug}` : "/profiles") : `/login?verified=1&email=${encodeURIComponent(form.email.trim())}`, { replace: true });
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
    <main className="auth-page auth-page--minimal">
      <MarketingNavbar />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Verify your email</h2>
                <p className="auth-meta">Enter the code we sent to your email to finish setting up your account.</p>
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
                   onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
                   inputMode="numeric"
                   autoComplete="one-time-code"
                   maxLength={4}
                  minLength={4}
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
