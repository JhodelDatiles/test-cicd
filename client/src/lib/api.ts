import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = axios.isAxiosError(error)
      ? (error.response?.data?.error ?? error.message)
      : "Request failed";
    return Promise.reject(new Error(message));
  },
);

export interface AuthUser {
  id: string;
  email: string;
  role?: "user" | "admin";
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
};