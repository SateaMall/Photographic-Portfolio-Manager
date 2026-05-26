import { useState, type CSSProperties, type SubmitEvent } from "react";
import { Link, useLocation } from "react-router-dom";

import { forgotPassword } from "../../../api/auth";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

const forgotPasswordPageStyle: CSSProperties & Record<"--auth-page-media", string> = {
  "--auth-page-media": 'url("/Ready5_265592.JPG")',
};

function readEmailFromSearch(search: string) {
  return new URLSearchParams(search).get("email") ?? "";
}

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState(readEmailFromSearch(location.search));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setSuccess(response.message);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to send a reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--minimal" style={forgotPasswordPageStyle}>
      <MarketingNavbar overlay />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Forgot your password?</h2>
                <p className="auth-meta">Enter your email and we will send you a password reset link.</p>
              </div>

              {success && <p className="auth-success">{success}</p>}
              {error && <p className="auth-error">{error}</p>}

              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <div className="auth-actions">
                <button className="auth-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Sending link..." : "Send reset link"}
                </button>
              </div>

              <div className="auth-secondary-actions">
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
