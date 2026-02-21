import bgSatea from "../assets/bg-satea.jpg";
import bgShared from "../assets/bg-shared.jpg";
import bgAlexis from "../assets/bg-alexis.jpg";
import type { Profile } from "../types/types";

export const PROFILES: Profile[] = [
      {
    id: "SATEA",
    label: "Mohamad Satea Almallouhi",
    avatar: { type: "initials", primaryColor: "#8b4845ff", secondaryColor: "#c81b12ff"},
    linkedIn: "satea-almallouhi",
    instagram: "satea_almallouhi",
    location: "Montpellier, France",
    bio: "Amature in photography, and bla bla",
    email: "sate3.mallouhi@gmail.com"


  },
      {
    id: "SHARED",
    label: "Shared space",
    avatar: { type: "initials", primaryColor:"#3e5a96ff", secondaryColor: "#124ac2ff"   },
    linkedIn: "",
    instagram: "",
    location: "",
    bio: "",
    email: ""
  },
  {
    id: "ALEXIS",
    label: "Alexis Cordier",
    avatar: { type: "initials", primaryColor: "#978e40ff", secondaryColor:  "#ddec0dff" },
    linkedIn: "alexis683off",
    instagram: "alexis683off",
    location: "Toulouse, France",
    bio: "Hi my name is Alexis, and I like to take and edit pictures as an amateur.",
    email: "alexis.cordier683@icloud.com "
  },
];

export const PROFILE_BY_ID: Record<Profile["id"], Profile> =
  Object.fromEntries(PROFILES.map(p => [p.id, p])) as Record<
    Profile["id"],
    Profile
  >;
export const BG_BY_ID: Record<Profile["id"], string> = {
  SATEA: bgSatea,
  SHARED: bgShared,
  ALEXIS: bgAlexis,
};

