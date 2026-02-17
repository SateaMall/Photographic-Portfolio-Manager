import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BsLinkedin, BsInstagram, BsEnvelope } from "react-icons/bs";
import { PROFILE_BY_ID } from "../../../constants/constants";
import "./SocialBioSection.css";

type ContextId = "SATEA" | "ALEXIS" | "SHARED";

function buildLinks(profile: {
  linkedIn?: string | null;
  instagram?: string | null;
  email?: string | null;
}) {
  const linkedInUrl = profile.linkedIn?.trim()
    ? `https://www.linkedin.com/in/${profile.linkedIn.trim()}`
    : "";

  const instagramUrl = profile.instagram?.trim()
    ? `https://www.instagram.com/${profile.instagram.trim().replace(/^@/, "")}/`
    : "";

  

  return { linkedInUrl, instagramUrl };
}

export function SocialBioSection() {
  const { context } = useParams();
  const ctx = (context?.toUpperCase() as ContextId) ?? "SHARED";

  const profilesToShow = useMemo(() => {
    if (ctx === "SHARED") {
      return [PROFILE_BY_ID["SATEA"], PROFILE_BY_ID["ALEXIS"]].filter(Boolean);
    }
    const p = PROFILE_BY_ID[ctx];
    return p ? [p] : [];
  }, [ctx]);

  const hasAny = profilesToShow.some((p) => {
    const { linkedInUrl, instagramUrl } = buildLinks(p);
    return Boolean(linkedInUrl || instagramUrl || p.bio || p.email);
  });

  if (!hasAny) return null;

  return (
    <section className="hero-bio" aria-label="Bio and social links">
      <div className={profilesToShow.length===1 
      ? "hero-bio__inner"
      : "hearo-bio_ineer_two-columns"}>
        {profilesToShow.map((p) => {
          const { linkedInUrl, instagramUrl } = buildLinks(p);

          const hasLinks = Boolean(linkedInUrl || instagramUrl || p.email);
          const hasBio = Boolean(p.bio?.trim());

          if (!hasLinks && !hasBio) return null;

          return (
            <article className="hero-bio__card" key={p.id}>
              <h2 className="hero-bio__name">{p.label}</h2>

              {p.bio?.trim() ? (
                <p className="hero-bio__text">{p.bio.trim()}</p>
              ) : (
                <div className="hero-bio__text hero-bio__text--empty" />
              )}

              <div className="hero-bio__icons" aria-label={`${p.label} social links`}>
                {linkedInUrl && (
                  <a
                    className="hero-bio__icon"
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.label} LinkedIn`}
                    title="LinkedIn"
                  >
                    <BsLinkedin />
                  </a>
                )}

                {instagramUrl && (
                  <a
                    className="hero-bio__icon"
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.label} Instagram`}
                    title="Instagram"
                  >
                    <BsInstagram />
                  </a>
                )}

                {p.email && (
                  <a
                    className="hero-bio__icon"
                    aria-label={`${p.label} Email`}
                    title="Email"
                    onClick={() => {
                      navigator.clipboard.writeText(p.email!);
                      alert("Email copied!");
                    }}
                  >
                    <BsEnvelope />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
