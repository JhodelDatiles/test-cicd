import { createContext } from "react";
import type { AuthUser } from "../lib/api";

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);