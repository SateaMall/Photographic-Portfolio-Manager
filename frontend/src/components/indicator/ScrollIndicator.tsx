import { BsChevronDoubleDown } from "react-icons/bs";
import "./ScrollIndicator.css";

type ScrollIndicatorProps = {
  targetId: string[]; // ID of the element to scroll to
};
      
export function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
  return (
    <button
      className="hero-scroll-indicator"
      onClick={() => {
        const el = targetId
          .map((id) => document.getElementById(id))
          .find((node): node is HTMLElement => node !== null);

        if (!el) {
          return;
        }

        try {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          el.scrollIntoView(true);
        }
      }}
      aria-label="Scroll down"
    >
      <BsChevronDoubleDown />
    </button>
  );
}
