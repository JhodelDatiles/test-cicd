import { useState, type ReactNode } from "react";
import type { AuthUser } from "../lib/api";
import { setAuthToken } from "../lib/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
    <AuthContext.Provider value={{ user, accessToken, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
};