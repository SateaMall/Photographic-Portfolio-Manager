import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { PhotoResponse } from "../../types/types";
import { photoFileUrl } from "../../api/photos";
import "./CarrouselTopper.css";



export function CarrouselTopper({ carrouselPhotos }: { carrouselPhotos: PhotoResponse[] }) {

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start",   /* loop: true,*/   }); 
      //Left-Right buttons state
  const [canPrev, setCanPrev] = useState(false); 
  const [canNext, setCanNext] = useState(false);

      //Dots state
  //const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  //const [selectedIndex, setSelectedIndex] = useState(0);

  const update = useCallback(() => {
    if (!emblaApi) return;
    //Left-Right buttons state
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    
    //Dots state
    //setScrollSnaps(emblaApi.scrollSnapList());
    //setSelectedIndex(emblaApi.selectedScrollSnap);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    
  }, [emblaApi, update]);


 /* //AUTOPLAY
  useEffect(() => {
    if (!emblaApi) return;

    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 3500); // 3.5s

    return () => window.clearInterval(id);
  }, [emblaApi]);
*/
  return (
    <div className="carousel_topper">
      {/* Left-Right navigation buttons */}
      <button
        type="button"
        className={`nav_topper nav-left_topper ${canPrev ? "" : "is-hidden"}`}
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
      >
        <span className="nav-icon_topper">‹</span>
      </button>

       <div className="embla__viewport_topper" ref={emblaRef}>
        <div className="embla__container_topper">
          {carrouselPhotos.map((c) => (
            <div className="embla__slide_topper" key={c.id}>
              <img
                src={photoFileUrl(c.id)}
                className="embla-img_topper"
                alt={c.title ?? ""}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

 {/* Left-Right navigation buttons */}
      <button
        type="button"
        className={`nav_topper nav-right_topper ${canNext ? "" : "is-hidden"}`}
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
      >
        <span className="nav-icon_topper">›</span>
      </button>

      {/* <div className="embla__dots_topper" aria-label="Carousel pagination">
  {scrollSnaps.map((_, idx) => (
    <button
      key={idx}
      type="button"
      className={`embla__dot_topper ${
        idx === selectedIndex ? "is-active" : ""
      }`}
      onClick={() => emblaApi?.scrollTo(idx)}
      aria-label={`Go to slide ${idx + 1}`}
      aria-current={idx === selectedIndex ? "true" : undefined}
    />
  ))}
</div>*/}

    </div>
  );
}