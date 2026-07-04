import type { NestUser } from "./types";

/**
 * Looks up the app user in Nest by Better Auth email.
 * Wire this to your Nest internal endpoint once it exists.
 */
export async function getNestUserByEmail(
  email: string,
): Promise<NestUser | null> {
  const nestApiUrl = process.env.NEST_API_URL;

  if (!nestApiUrl) {
    throw new Error("NEST_API_URL is not configured");
  }

  const response = await fetch(
    `${nestApiUrl}/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEST_INTERNAL_API_KEY ?? ""}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Nest user lookup failed with status ${response.status}`);
  }

  return response.json() as Promise<NestUser>;
}
