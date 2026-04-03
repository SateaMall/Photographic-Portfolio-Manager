
import "./ProfilesPage.css";


export default function ProfilesPages() {

 return <div className="profiles-page">
   <h1>Profiles</h1>
   <p>Choose a profile to view its gallery:</p>
   </div>

/* const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<Profile["id"] | null>(null);

  const currentBg = useMemo(() => {
    return hoveredId ? BG_BY_ID[hoveredId] : BG_BY_ID["SHARED"];
  }, [hoveredId]);

 async function onPickProfile(p: Profile) {
    const routeContext = p.id; 
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
  */
}
