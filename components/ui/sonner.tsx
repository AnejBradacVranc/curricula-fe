"use client";

import { useSyncExternalStore } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Toaster } from "sonner";

function subscribeToColorScheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getColorScheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerColorScheme(): "dark" | "light" {
  return "light";
}

function useColorScheme(): "dark" | "light" {
  return useSyncExternalStore(
    subscribeToColorScheme,
    getColorScheme,
    getServerColorScheme,
  );
}

export function AppToaster() {
  const theme = useColorScheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      className="toaster group"
      icons={{
        success: (
          <CircleCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" />
        ),
        error: (
          <CircleX className="size-4 shrink-0 text-destructive" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-popover !text-popover-foreground !border-border rounded-xl shadow-lg ring-1 ring-foreground/10",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          closeButton:
            "!bg-muted !text-muted-foreground !border-border hover:!bg-accent",
          success: "!border-border",
          error: "!border-border [&_[data-icon]]:!text-destructive",
          warning: "!border-border [&_[data-icon]]:!text-muted-foreground",
          info: "!border-border [&_[data-icon]]:!text-muted-foreground",
        },
      }}
    />
  );
}
