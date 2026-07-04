import { SignJWT } from "jose";
import type { NestUser } from "./types";

const DEFAULT_EXPIRES_IN = "15m";

function getExpiresInSeconds(expiresIn = DEFAULT_EXPIRES_IN): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return 15 * 60;
  }
}

export async function signNestAccessToken(user: NestUser): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const secret = process.env.NEST_JWT_SECRET;

  if (!secret) {
    throw new Error("NEST_JWT_SECRET is not configured");
  }

  const expiresInSetting = process.env.NEST_JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN;
  const expiresIn = getExpiresInSeconds(expiresInSetting);

  const accessToken = await new SignJWT({
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    name: user.name,
    surname: user.surname,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(expiresInSetting)
    .sign(new TextEncoder().encode(secret));

  return { accessToken, expiresIn };
}
