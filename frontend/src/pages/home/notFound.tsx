import { useLocation } from "react-router-dom";
export default function NotFound() {
  const loc = useLocation();
  return <div>Not Found: {loc.pathname}</div>;
}
