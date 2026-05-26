import { useState, type CSSProperties, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { resetPassword } from "../../../api/auth";
import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import "./AuthPages.css";

const resetPasswordPageStyle: CSSProperties & Record<"--auth-page-media", string> = {
  "--auth-page-media": 'url("/Ready5_265592.JPG")',
};

function readTokenFromSearch(search: string) {
  return new URLSearchParams(search).get("token") ?? "";
}

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = readTokenFromSearch(location.search);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This password reset link is missing a token.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({ token, newPassword: form.newPassword });
      navigate("/login", {
        replace: true,
        state: {
          message: "Password updated. You can sign in now.",
        },
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--minimal" style={resetPasswordPageStyle}>
      <MarketingNavbar overlay />
      <div className="auth-shell">
        <div className="auth-grid auth-grid--single">
          <section className="auth-panel auth-panel--minimal">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <h2 className="auth-title">Create a new password</h2>
                <p className="auth-meta">Choose a new password for your account.</p>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <label className="auth-field">
                <span className="auth-label">New password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Confirm new password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </label>

              <div className="auth-actions">
                <button className="auth-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? "Updating password..." : "Update password"}
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
