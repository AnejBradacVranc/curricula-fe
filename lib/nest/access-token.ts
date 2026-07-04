import { NestAuthError } from "./errors";
import type { NestAccessTokenResponse } from "./types";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;
let fetchRequest: Promise<string> | null = null;

export function clearNestAccessTokenCache() {
  cachedToken = null;
  fetchRequest = null;
}

export async function setAccessTokenFromNext(options?: {
  force?: boolean;
}): Promise<string> {
  const force = options?.force ?? false;

  if (!force && cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.accessToken;
  }

  if (!force && fetchRequest) {
    return fetchRequest;
  }

  fetchRequest = fetchAccessTokenFromNext(force);

  try {
    return await fetchRequest;
  } finally {
    fetchRequest = null;
  }
}

async function fetchAccessTokenFromNext(force: boolean): Promise<string> {
  const response = await fetch("/api/auth/nest-token", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (force) {
      cachedToken = null;
    }

    throw new NestAuthError(
      "Unable to obtain Nest access token",
      response.status,
    );
  }

  const payload = (await response.json()) as NestAccessTokenResponse;

  cachedToken = {
    accessToken: payload.accessToken,
    expiresAt: Date.now() + payload.expiresIn * 1000,
  };

  return payload.accessToken;
}
