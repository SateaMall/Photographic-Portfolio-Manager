import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotoResponse } from "../../types/types";
import { photoFileUrl } from "../../api/photos";
import "./CarrouselTopper.css";
import { useParams } from "react-router-dom";

export function CarrouselTopper({ carrouselPhotos }: { carrouselPhotos: PhotoResponse[] }) {
  const { slug } = useParams();

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplayTimeoutRef = useRef<number | null>(null);
  const AUTOPLAY_DELAY = 7000;

  const update = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const clearAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current !== null) {
      window.clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const restartAutoplay = useCallback(() => {
    if (!emblaApi) return;

    clearAutoplay();

    autoplayTimeoutRef.current = window.setTimeout(() => {
      if (!emblaApi) return;

      if (!emblaApi.canScrollNext()) {
        emblaApi.scrollTo(0);
      } else {
        emblaApi.scrollNext();
      }

      restartAutoplay(); // schedule next autoplay after moving
    }, AUTOPLAY_DELAY);
  }, [emblaApi, clearAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    const frameId = window.requestAnimationFrame(update);

    emblaApi.on("select", update);
    emblaApi.on("reInit", update);

    return () => {
      window.cancelAnimationFrame(frameId);
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi, update]);

  useEffect(() => {
    if (!emblaApi) return;

    const frameId = window.requestAnimationFrame(() => {
      emblaApi.reInit();
      update();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [emblaApi, carrouselPhotos.length, update]);

  useEffect(() => {
    if (!emblaApi || carrouselPhotos.length <= 1) return;

    restartAutoplay();

    return () => {
      clearAutoplay();
    };
  }, [emblaApi, carrouselPhotos.length, restartAutoplay, clearAutoplay]);

  const handlePrev = () => {
    emblaApi?.scrollPrev();
    restartAutoplay();
  };

  const handleNext = () => {
    emblaApi?.scrollNext();
    restartAutoplay();
  };

  const hasPhotos = carrouselPhotos.length > 0;
  if (!slug) return null;

  return (
    <div className={`carousel_topper ${hasPhotos ? "" : "carousel_topper--empty"}`}>
      {hasPhotos ? (
        <>
          <button
            type="button"
            className={`nav_topper nav-left_topper ${canPrev ? "" : "is-hidden"}`}
            onClick={handlePrev}
            disabled={!canPrev}
          >
            <span className="nav-icon_topper">‹</span>
          </button>

          <div className="embla__viewport_topper" ref={emblaRef}>
            <div className="embla__container_topper">
              {carrouselPhotos.map((c, i) => (
                <div className="embla__slide_topper" key={c.id}>
                  <img
                    src={photoFileUrl(c.id, slug)}
                    className={`embla-img_topper embla__img ${i === selectedIndex ? "is-active" : ""}`}
                    alt={c.title ?? ""}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`nav_topper nav-right_topper ${canNext ? "" : "is-hidden"}`}
            onClick={handleNext}
            disabled={!canNext}
          >
            <span className="nav-icon_topper">›</span>
          </button>
        </>
      ) : (
        <div className="carousel_topper__empty"></div>
      )}
    </div>
  );
}