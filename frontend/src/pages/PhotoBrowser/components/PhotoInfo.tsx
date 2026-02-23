type Props = {
  mainPhoto: MainPhotoResponse | null;
  mainProfile: Profile | null;
}
import type { MainPhotoResponse, Profile } from "../../../types/types";
import "./PhotoInfo.css";

export default function PhotoInfo({ mainPhoto, mainProfile }: Props){
  const title = mainPhoto?.title?.trim() || "Untitled";
  const description = mainPhoto?.description?.trim?.() || mainPhoto?.description ;
  const owner = mainProfile?.label ;
  const themes = mainPhoto?.themes ?? (mainPhoto as any)?.themeNames ?? [];
  const location = [mainPhoto?.city, mainPhoto?.country].filter(Boolean).join(", ") ;
  const captureYear = mainPhoto?.captureYear;

  return (
    <div aria-label="Photo details">
        <div className="photo-page__subline">
            <h1 className="photo-page__title">{title}</h1>
            <span className="meta-sep">•</span>
            <span className="meta-pill"> {location}</span>
            <span className="meta-sep">•</span>
            <span className="meta-pill"> {captureYear}</span>
            <span className="meta-sep">•</span>
            <span className="meta-pill"> {owner}</span>
        </div>

        <details className="meta-details">
            <summary className="meta-summary">More details</summary>
            <p className="photo-page__desc">{description}</p>
            <dl className="photo-page__dl">
                <div className="photo-page__row">
                    <dt className="meta-headlines">Themes</dt>
                    <dd>
                      {Array.isArray(themes) && themes.length > 0 ? (
                        <div className="photo-page__chips">
                          {themes.map((t: string) => (
                            <span key={t} className="photo-page__chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </dd>
                </div>
            </dl>
        </details>
    </div>
  );
}