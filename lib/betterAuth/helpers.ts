import { authClient } from "./auth";

export const signUp = async (
  email: string,
  password: string,
  name: string,
  image?: string,
) => {
  const { data, error } = await authClient.signUp.email(
    {
      email,
      password,
      name,
      image,
      callbackURL: "/dashboard",
    },
    {
      onError: (ctx) => {
        alert(ctx.error.message);
      },
    },
  );

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
      callbackURL: "/dashboard",
      rememberMe: true,
    },
    {
      onSuccess: () => {
        window.location.href = "/dashboard";
      },
      onError: (ctx) => {
        alert(ctx.error.message);
      },
    },
  );

  return { data, error };
};

export const signOutUser = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/login";
      },
    },
  });
};
