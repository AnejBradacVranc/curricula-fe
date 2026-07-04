"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/betterAuth/auth";
import { signOutUser } from "@/lib/betterAuth/helpers";
import { setAccessTokenFromNext } from "@/lib/nest/access-token";
import { getNestLinkErrorMessage } from "@/lib/nest/link-session";

export function DashboardPanel() {
  const { data: session, isPending } = useSession();
  const [nestStatus, setNestStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [nestError, setNestError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setNestStatus("idle");
      setNestError(null);
      return;
    }

    let cancelled = false;

    async function loadNestSession() {
      setNestStatus("loading");
      setNestError(null);

      try {
        await setAccessTokenFromNext();
        if (!cancelled) {
          setNestStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setNestStatus("error");
          setNestError(getNestLinkErrorMessage(error));
        }
      }
    }

    void loadNestSession();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (isPending) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">Not signed in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You need an account before you can view the dashboard.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Signed in
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Welcome, {session.user.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {session.user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium">Nest API session</p>
        {nestStatus === "loading" && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Linking Nest access token...
          </p>
        )}
        {nestStatus === "ready" && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            Ready. `nestApi` calls will include a valid Bearer token.
          </p>
        )}
        {nestStatus === "error" && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            {nestError}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-medium">Better Auth session</p>
        <pre className="overflow-x-auto text-xs leading-6 text-zinc-700 dark:text-zinc-300">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
