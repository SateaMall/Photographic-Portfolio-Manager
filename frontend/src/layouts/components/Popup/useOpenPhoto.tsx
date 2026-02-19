import { useLocation, useNavigate, useParams } from "react-router-dom";

type ModalState = { backgroundLocation?: Location };

export function useOpenPhoto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { context } = useParams<{ context: string }>();

  return (photoId: string, mode: "modal" | "auto" = "auto") => {
    if (!context) return;

    const state = location.state as ModalState | null;
    const bg = state?.backgroundLocation;
    const inModal = Boolean(bg);

    // If already in a modal, keep the SAME background and replace history
    if (inModal) {
      navigate(`/${context}/photo/${photoId}`, {
        replace: true,
        state: { backgroundLocation: bg },
      });
      return;
    }

    // Not in a modal: open as modal only when asked (homepage/album)
    if (mode === "modal") {
      navigate(`/${context}/photo/${photoId}`, {
        state: { backgroundLocation: location },
      });
      return;
    }

    // Otherwise behave normally (full page)
    navigate(`/${context}/photo/${photoId}`);
  };
}
