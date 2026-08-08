import { useNavigate } from "react-router-dom";
import { logoutUser, setAuthToken } from "../lib/api";
import { useAuth } from "./useAuth";

export const useLogout = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  return async () => {
    try {
      await logoutUser();
    } catch {
      // Refresh cookie may already be expired/invalid — local cleanup still proceeds
    } finally {
      setAuthToken(null);
      clearSession();
      navigate("/login");
    }
  };
};