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
