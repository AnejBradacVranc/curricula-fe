import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearNestAccessTokenCache,
  setAccessTokenFromNext,
} from "./access-token";

export const nestApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

nestApi.interceptors.request.use(async (config) => {
  config.baseURL ??= process.env.NEXT_PUBLIC_NEST_API_URL;

  if (!config.baseURL) {
    throw new Error("NEXT_PUBLIC_NEST_API_URL is not configured");
  }

  const accessToken = await setAccessTokenFromNext();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

nestApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      clearNestAccessTokenCache();

      const accessToken = await setAccessTokenFromNext({ force: true });
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return nestApi(originalRequest);
    }

    return Promise.reject(error);
  },
);
