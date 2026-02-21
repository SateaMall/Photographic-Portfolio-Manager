import { useMemo, useState } from "react";
import "./ProfilesPage.css";
import { useNavigate } from "react-router-dom";

import { BsPersonFill, BsLink45Deg } from "react-icons/bs";
import type { Profile } from "../../types/types";
import { PROFILES, BG_BY_ID } from "../../constants/constants";

export default function ProfilesPages() {
 const navigate = useNavigate();

/* Background switcher */
  const [hoveredId, setHoveredId] = useState<Profile["id"] | null>(null);

  const currentBg = useMemo(() => {
    return hoveredId ? BG_BY_ID[hoveredId] : BG_BY_ID["SHARED"];
  }, [hoveredId]);

 async function onPickProfile(p: Profile) {
    const routeContext = p.id; // "SATEA" | "ALEXIS" | "SHARED"
    navigate(`/${routeContext}`);
  }

  

  return (


    <div className="page font-copperplate" style={{ backgroundImage: `url(${currentBg})` }}>
       
          <div className="ps-grid">
            {PROFILES.map((p) => {
              const isShared = p.id === "SHARED";
              return(
              <button
                key={p.id}
                className="ps-card"
                type="button"
                onClick={() => onPickProfile(p)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(p.id)}   // nice for keyboard
                onBlur={() => setHoveredId(null)}
                style={{ ["--bgCard" as any]: p.avatar?.primaryColor  ?? "#111827" ,
                  ["--bgCardHover" as any]: p.avatar?.secondaryColor ?? p.avatar?.primaryColor ?? "#111827" ,
                }}
              >
                <div className="ps-icon" aria-hidden="true">
                {isShared ? <BsLink45Deg /> : <BsPersonFill />}
              </div>
                <div className="ps-label">{p.label}</div>
              </button>
                );
        })}
          </div>
    </div>

  );
}
