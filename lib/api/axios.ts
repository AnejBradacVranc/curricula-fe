import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
