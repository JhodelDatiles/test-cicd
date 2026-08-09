import { useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "../lib/api";
import { setAuthToken, refreshAccessToken, getMe } from "../lib/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      try {
        const token = await refreshAccessToken();
        setAuthToken(token);
        const me = await getMe();
        setUser(me);
        setAccessToken(token);
      } catch {
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []);

  const setSession = (nextUser: AuthUser, token: string) => {
    setUser(nextUser);
    setAccessToken(token);
    setAuthToken(token);
  };

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
};