import axios, { type InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "curricula_access_token";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;

export function getAccessToken() {
  if (accessToken) {
    return accessToken;
  }

  if (typeof window !== "undefined") {
    accessToken = sessionStorage.getItem(TOKEN_KEY);
  }

  return accessToken;
}

export function isAccessTokenValid(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthLogin = url.includes("/auth/login");
    if (status === 401 && !isAuthLogin && getAccessToken()) {
      setAccessToken(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
