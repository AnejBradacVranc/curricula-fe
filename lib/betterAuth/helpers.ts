import {
  clearNestAccessTokenCache,
  setAccessTokenFromNext,
} from "@/lib/nest/access-token";
import { getNestLinkErrorMessage } from "@/lib/nest/link-session";
import { authClient } from "./auth";

export type AuthResult = {
  data: unknown;
  error: { message?: string } | null;
  nestError: string | null;
};

async function finalizeAuth(data: unknown): Promise<AuthResult> {
  try {
    clearNestAccessTokenCache();
    await setAccessTokenFromNext({ force: true });

    window.location.href = "/dashboard";

    return { data, error: null, nestError: null };
  } catch (error) {
    return {
      data,
      error: null,
      nestError: getNestLinkErrorMessage(error),
    };
  }
}

export const signUp = async (
  email: string,
  password: string,
  name: string,
  image?: string,
): Promise<AuthResult> => {
  const { data, error } = await authClient.signUp.email(
    {
      email,
      password,
      name,
      image,
    },
    {
      onError: (ctx) => {
        alert(ctx.error.message);
      },
    },
  );

  if (error) {
    return { data, error, nestError: null };
  }

  return finalizeAuth(data);
};

export const signIn = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
      rememberMe: true,
    },
    {
      onError: (ctx) => {
        alert(ctx.error.message);
      },
    },
  );

  if (error) {
    return { data, error, nestError: null };
  }

  return finalizeAuth(data);
};

export const signOutUser = async () => {
  clearNestAccessTokenCache();

  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/login";
      },
    },
  });
};
