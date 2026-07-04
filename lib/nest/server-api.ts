import { headers } from "next/headers";
import { auth } from "@/auth";
import { NestApiError, NestAuthError } from "./errors";
import { signNestAccessToken } from "./token";
import { getNestUserByEmail } from "./user";

async function getServerNestAccessToken(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.email) {
    throw new NestAuthError("Unauthorized", 401);
  }

  const nestUser = await getNestUserByEmail(session.user.email);

  if (!nestUser) {
    throw new NestAuthError("User not provisioned in Nest", 404);
  }

  const { accessToken } = await signNestAccessToken(nestUser);
  return accessToken;
}

function getNestApiBaseUrl() {
  const baseURL = process.env.NEST_API_URL;

  if (!baseURL) {
    throw new Error("NEST_API_URL is not configured");
  }

  return baseURL;
}

export async function nestServerFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = await getServerNestAccessToken();
  const baseURL = getNestApiBaseUrl();

  const response = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    throw new NestApiError(
      `Nest API request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
