/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getMe, logout as logoutRequest, type AuthMeResponse } from "../api/auth";

type AuthSession = {
  authenticated: boolean;
  email: string | null;
  profileSlug: string | null;
  displayName: string | null;
};

type AuthContextValue = {
  session: AuthSession;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<AuthSession>;
  signOut: () => Promise<void>;
};

const ANONYMOUS_SESSION: AuthSession = {
  authenticated: false,
  email: null,
  profileSlug: null,
  displayName: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toSession(response: AuthMeResponse): AuthSession {
  return {
    authenticated: response.authenticated,
    email: response.email ?? null,
    profileSlug: response.profileSlug ?? null,
    displayName: response.displayName ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(ANONYMOUS_SESSION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const nextSession = toSession(await getMe());
      setSession(nextSession);
      setError(null);
      return nextSession;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load the current session.";
      setSession(ANONYMOUS_SESSION);
      setError(message);
      return ANONYMOUS_SESSION;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
      setSession(ANONYMOUS_SESSION);
      setError(null);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to sign out right now.";
      setError(message);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session.authenticated,
      loading,
      error,
      refreshSession,
      signOut,
    }),
    [error, loading, refreshSession, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
