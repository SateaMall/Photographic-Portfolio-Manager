import { Navigate, Outlet, useParams} from "react-router-dom";
const ALLOWED = new Set(["SATEA", "ALEXIS", "SHARED"]);
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToHash } from "./components/ScrollToHash";



export default function GalleryLayout() {
  const { context } = useParams();

  if (!context || !ALLOWED.has(context)) {
    return <Navigate to="/profiles" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      <Outlet />
  
    </>
  );
}
