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

  const hasAny = profilesToShow.some((profile) => {
    const { linkedInUrl, instagramUrl } = buildLinks(profile);
    return Boolean(linkedInUrl || instagramUrl || profile.bio || profile.email);
  });

  if (!hasAny) return null;

  return (
    <section className="hero-bio" aria-label="Bio and social links">
      <div className={profilesToShow.length===1 
      ? "hero-bio__inner"
      : "hearo-bio_ineer_two-columns"}>
        {profilesToShow.map((profile) => {
          const { linkedInUrl, instagramUrl } = buildLinks(profile);

          const hasLinks = Boolean(linkedInUrl || instagramUrl || profile.email);
          const hasBio = Boolean(profile.bio?.trim());

          if (!hasLinks && !hasBio) return null;

          return (
            <article className="hero-bio__card" key={profile.id}>
              <h2 className="hero-bio__name">{profile.label}</h2>

              {profile.bio?.trim() ? (
                <p className="hero-bio__text">{profile.bio.trim()}</p>
              ) : (
                <div className="hero-bio__text hero-bio__text--empty" />
              )}

              <div className="hero-bio__icons" 
                aria-label={`${profile.label} social links`}
              >
                {linkedInUrl && (
                  <a
                    className="hero-bio__icon"
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${profile.label} LinkedIn`}
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
                    aria-label={`${profile.label} Instagram`}
                    title="Instagram"
                  >
                    <BsInstagram />
                  </a>
                )}

                {profile.email && (
                  <a
                    className="hero-bio__icon"
                    aria-label={`${profile.label} Email`}
                    title="Email"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.email!);
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
