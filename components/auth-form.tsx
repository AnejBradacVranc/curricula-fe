"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/betterAuth/helpers";

type Mode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const { error } = await signUp(email, password, name);
        if (error) {
          setMessage(error.message ?? "Sign up failed.");
          return;
        }

        setMode("sign-in");
        setPassword("");
        setMessage("Account created. Sign in to continue.");
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        setMessage(error.message ?? "Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Better Auth demo with email and password.
        </p>
      </div>

      <div className="mb-6 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setMessage(null);
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "sign-in"
              ? "bg-white text-zinc-950 shadow dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setMessage(null);
          }}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "sign-up"
              ? "bg-white text-zinc-950 shadow dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none ring-zinc-950 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Jane Doe"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none ring-zinc-950 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none ring-zinc-950 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="At least 8 characters"
          />
        </label>

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.includes("created")
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {loading
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
