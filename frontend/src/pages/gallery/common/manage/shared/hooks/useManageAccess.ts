import { useParams } from "react-router-dom";

import { useAuth } from "../../../../../../auth/AuthContext";
import { normalizeSlug } from "../utils/manageSlug";

export function useManageAccess() {
  const { slug } = useParams();
  const { session, isAuthenticated, loading: authLoading, refreshSession } = useAuth();
  const profileSlug = normalizeSlug(slug);
  const canManage = isAuthenticated && normalizeSlug(session.profileSlug) === profileSlug;

  return {
    authLoading,
    canManage,
    isAuthenticated,
    profileSlug,
    refreshSession,
    session,
  };
}
