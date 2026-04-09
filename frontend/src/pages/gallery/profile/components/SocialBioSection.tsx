import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsLinkedin, BsInstagram, BsEnvelope } from "react-icons/bs";

import { fetchPublicProfile } from "../../../../api/profile";
import type { PublicProfileResponse } from "../../../../types/types";
import "./SocialBioSection.css";


function buildLinks(profile: {
  linkedIn?: string | null;
  instagram?: string | null;
  publicEmail?: string | null;
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
  const { slug } = useParams();
  const profileSlug = slug?.trim().toLowerCase() ?? "";
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);

  useEffect(() => {
    let active = true;

    if (!profileSlug) {
      return () => {
        active = false;
      };
    }

    fetchPublicProfile(profileSlug)
      .then((result) => {
        if (active) {
          setProfile(result);
        }
      })
      .catch(() => {
        if (active) {
          setProfile(null);
        }
      });

    return () => {
      active = false;
    };
  }, [profileSlug]);

  if (!profile) return null;

  const { linkedInUrl, instagramUrl } = buildLinks(profile);
  const hasLinks = Boolean(linkedInUrl || instagramUrl || profile.publicEmail);
  const hasBio = Boolean(profile.bio?.trim());

  if (!hasLinks && !hasBio) return null;

  return (
    <section className="hero-bio" aria-label="Bio and social links">
      <div className="hero-bio__inner">
        <article className="hero-bio__card" key={profile.slug}>
          <h2 className="hero-bio__name">{profile.displayName}</h2>

          {profile.bio?.trim() ? (
            <p className="hero-bio__text">{profile.bio.trim()}</p>
          ) : (
            <div className="hero-bio__text hero-bio__text--empty" />
          )}

          <div className="hero-bio__icons" 
            aria-label={`${profile.displayName} social links`}
          >
            {linkedInUrl && (
              <a
                className="hero-bio__icon"
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${profile.displayName} LinkedIn`}
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
                aria-label={`${profile.displayName} Instagram`}
                title="Instagram"
              >
                <BsInstagram />
              </a>
            )}

            {profile.publicEmail && (
              <button
                className="hero-bio__icon"
                type="button"
                aria-label={`${profile.displayName} Email`}
                title="Email"
                onClick={() => {
                  navigator.clipboard.writeText(profile.publicEmail!);
                  alert("Email copied!");
                }}
              >
                <BsEnvelope />
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
