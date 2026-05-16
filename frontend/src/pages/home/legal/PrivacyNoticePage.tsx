import { MarketingNavbar } from "../components/navigation/MarketingNavbar";
import { ScrollToTop } from "../../../layouts/components/ScrollToTop";
import "./LegalPage.css";

export default function PrivacyNoticePage() {
  return (
    <main className="legal-page">
      <ScrollToTop />
      <MarketingNavbar />

      <div className="legal-shell">
        <article className="legal-card">
          <p className="legal-eyebrow">Legal</p>
          <h1 className="legal-title">Privacy Notice</h1>
          <p className="legal-meta">
            Last updated: 16 May 2026. This notice explains how Let Me Lens processes personal data when you
            create an account, sign in, publish a portfolio, or contact us.
          </p>

          <section className="legal-section">
            <h2>1. Who is responsible for your data?</h2>
            <p>
              Let Me Lens is responsible for the personal data described in this notice. For privacy questions
              or requests, contact <a className="legal-link" href="mailto:support@letmelens.com">support@letmelens.com</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. What data do we collect?</h2>
            <ul>
              <li>Account data such as your email address, password, first name, and last name.</li>
              <li>Verification and session data such as email verification codes and essential sign-in session data.</li>
              <li>
                Google sign-in data if you choose that option, such as your Google account identifier, email,
                first name, last name, full name, and email verification status.
              </li>
              <li>
                Profile and portfolio data you choose to provide or publish, such as display name, bio, public
                email, social links, albums, photos, and other uploaded content.
              </li>
              <li>Information you send when you contact support.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Why do we use this data?</h2>
            <ul>
              <li>To create and manage your account and provide the portfolio service.</li>
              <li>To verify your email address and authenticate your sign-in.</li>
              <li>To display the public profile and content that you choose to publish.</li>
              <li>To keep the service secure, prevent abuse, troubleshoot issues, and protect the platform.</li>
              <li>To comply with legal obligations where applicable.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. What is our legal basis?</h2>
            <ul>
              <li>
                Performance of a contract: to create your account, let you sign in, and operate your portfolio.
              </li>
              <li>Legitimate interests: to secure and improve the service, prevent misuse, and handle support.</li>
              <li>Legal obligation: where we must keep or disclose data under applicable law.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Which data is required and which is optional?</h2>
            <p>
              For email signup, your email address, password, first name, and last name are required. If you do
              not provide required data, we cannot create your account. Profile details, public contact details,
              social links, photos, albums, and other portfolio content are optional, but anything you choose to
              publish may be visible to visitors.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Who can receive your data?</h2>
            <ul>
              <li>Our hosting, storage, email delivery, and technical service providers.</li>
              <li>Google, if you choose Google sign-in.</li>
              <li>Public visitors, for data and content you choose to make public.</li>
              <li>Public authorities or courts where disclosure is required by law.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. How long do we keep your data?</h2>
            <ul>
              <li>Account and portfolio data are kept while your account is active.</li>
              <li>Verification codes are kept until they are used or expire.</li>
              <li>Essential session data is kept until logout or session expiry.</li>
              <li>
                If you request account deletion, we remove the account and related portfolio content from the
                active service unless retention is required for security or legal reasons.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. International transfers</h2>
            <p>
              If you use Google sign-in, or if one of our technical providers processes data outside the EU or
              EEA, your data may be transferred outside the EU or EEA subject to the safeguards offered by the
              relevant provider.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Your rights</h2>
            <p>
              Subject to applicable law, you may request access, rectification, erasure, restriction, objection,
              and data portability. To exercise your rights, contact <a className="legal-link" href="mailto:support@letmelens.com">support@letmelens.com</a>.
              You also have the right to lodge a complaint with the CNIL.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Cookies and similar technologies</h2>
            <p>
              We use essential session cookies to keep you signed in and secure the service. If we add
              non-essential analytics or marketing cookies later, we will provide separate notice and request
              consent where required.
            </p>
          </section>

          <p className="legal-footer">
            Privacy requests: <a className="legal-link" href="mailto:support@letmelens.com">support@letmelens.com</a>
          </p>
        </article>
      </div>
    </main>
  );
}
