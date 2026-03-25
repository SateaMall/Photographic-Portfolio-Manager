import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { AlbumCard } from "./AlbumCard";
import type { AlbumViewResponse } from "../../../types/types";


import "./AlbumsRow.css"


export function AlbumsRow({ albums }: { albums: AlbumViewResponse[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" }); // align : "start" sets it perfectly on the first card
  const [canPrev, setCanPrev] = useState(false); 
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
  }, [emblaApi, update]);

  return (
    <div className="albums-carousel">
      <button
        type="button"
        className={`albums-nav albums-nav-left ${canPrev ? "" : "is-hidden"}`}
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
      >
        <span className="albums-nav-icon">‹</span>
      </button>

      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {albums.map((a) => (
            <div className="embla__slide" key={a.albumId}>
              <AlbumCard album={a} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`albums-nav albums-nav-right ${canNext ? "" : "is-hidden"}`}
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
      >
        <span className="albums-nav-icon">›</span>
      </button>
    </div>
  );
}