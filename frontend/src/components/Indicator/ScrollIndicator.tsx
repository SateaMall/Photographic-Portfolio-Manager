import { BsChevronDoubleDown } from "react-icons/bs";
import "./ScrollIndicator.css";

type ScrollIndicatorProps = {
  targetId: string[]; // ID of the element to scroll to
};
      
export function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
    
    
    return (<button
        className="hero-scroll-indicator"
        onClick={() => 
            {
            const el= targetId
            .map(id => document.getElementById(id))
            .find((node): node is HTMLElement => node !== null);
            if (el) el.scrollIntoView({ behavior: "smooth" });
            }
        }
        aria-label="Scroll down"
      >
         <BsChevronDoubleDown  />
      </button>
      );
}