"use client";

import Link from "next/link";
import { useSession } from "@/lib/betterAuth/auth";
import { signOutUser } from "@/lib/betterAuth/helpers";

export function DashboardPanel() {
  const { data: session, isPending } = useSession();

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

      <div className="mt-8 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-medium">Session payload</p>
        <pre className="overflow-x-auto text-xs leading-6 text-zinc-700 dark:text-zinc-300">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
