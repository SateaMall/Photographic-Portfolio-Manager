import "./AlbumInfo.css";
import type { AlbumViewResponse } from "../../../../../types/types";
type AlbumInfoProps = {
  album: AlbumViewResponse | null;
  displayName?: string | null;
};

export function AlbumInfo({ album, displayName = null }: AlbumInfoProps) {
    const title = album?.title;
    const description = album?.description;
    const byline = displayName?.trim() ? `collection by ${displayName.trim()}` : null;
    return (
    <section className="hero-album-info" aria-label="Album title and description">
        <div className="album-info__inner hero-info__background">
            <h2 className="album-info__title">{title}</h2>
            {byline ? <p className="album-info__byline">{byline}</p> : null}
            <p className={description ? "album-info__description" : "album-description--empty"}>{description}</p>
        </div>
    </section>
  );
}
