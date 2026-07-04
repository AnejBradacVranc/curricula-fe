import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getNestUserByEmail } from "@/lib/nest/user";
import { signNestAccessToken } from "@/lib/nest/token";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nestUser = await getNestUserByEmail(session.user.email);

    if (!nestUser) {
      return NextResponse.json(
        { error: "User not provisioned in Nest" },
        { status: 404 },
      );
    }

    const { accessToken, expiresIn } = await signNestAccessToken(nestUser);

    return NextResponse.json({
      accessToken,
      expiresIn,
      tokenType: "Bearer",
    });
  } catch (error) {
    console.error("[nest-token]", error);

    return NextResponse.json(
      { error: "Failed to issue Nest access token" },
      { status: 500 },
    );
  }
}
