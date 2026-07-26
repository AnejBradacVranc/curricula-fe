"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="container flex flex-1 items-center justify-center py-12">
        <Skeleton className="h-80 w-full max-w-md rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container flex flex-1 items-center py-12">
      <AuthForm />
    </div>
  );
}
