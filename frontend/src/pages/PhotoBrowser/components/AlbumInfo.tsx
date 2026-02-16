import React from "react";
import "./AlbumInfo.css";
import type { AlbumViewResponse } from "../../../types/types";
type AlbumInfoProps = {
  album: AlbumViewResponse | null;
};

export function AlbumInfo(AlbumInfoProps: AlbumInfoProps) {
    const title= AlbumInfoProps.album?.title;
    const description= AlbumInfoProps.album?.description ;
    const photo_number = AlbumInfoProps.album?.numberOfPhotos;
    return (
    <section className="hero-album-info" aria-label="Album title and description">
        <div className="album-info__inner hero-info__background">
            <h2 className="album-info__title">{title}</h2>
            <p className= {description? "album-info__description":".album-description--empty"}>{description}</p>
            <p>{photo_number}</p>
        </div>
    </section>
  );
}