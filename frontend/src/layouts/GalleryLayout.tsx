import { Navigate, Outlet, useParams} from "react-router-dom";
const ALLOWED = new Set(["SATEA", "ALEXIS", "SHARED"]);
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToHash } from "./components/ScrollToHash";
import { PROFILE_BY_ID } from "../constants/constants";


export default function GalleryLayout() {
  const { context } = useParams();

  if (!context || !ALLOWED.has(context)) {
    return <Navigate to="/profiles" replace />;
  }
  const profile = context ? PROFILE_BY_ID[context.toUpperCase() as keyof typeof PROFILE_BY_ID] : null;
  return (
    <div
      style={{ ["--primaryColor" as any]: profile?.avatar?.primaryColor  ?? "#111827" ,
      ["--secondaryColor" as any]: profile?.avatar?.secondaryColor}}
    >
      <ScrollToTop />
      <ScrollToHash />
      <Outlet />
  
    </div>
  );
}
