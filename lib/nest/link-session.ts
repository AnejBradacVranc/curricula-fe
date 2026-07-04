import { NestAuthError } from "./errors";

export function getNestLinkErrorMessage(error: unknown): string {
  if (error instanceof NestAuthError) {
    if (error.status === 401) {
      return "Sign-in succeeded, but the app session could not be verified.";
    }

    if (error.status === 404) {
      return "Signed in, but your account is not provisioned in Nest yet.";
    }

    return "Signed in, but connecting to Nest failed. Try again shortly.";
  }

  return "Signed in, but connecting to Nest failed.";
}
