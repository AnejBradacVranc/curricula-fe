"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">
        Curricula
      </h1>
      <p className="mt-2 text-2xl text-muted-foreground">
        Aplikacija za beleženje ur učiteljev
      </p>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Upravljajte dodeljene ure za učitelje.{" "}
        {!isAuthenticated &&
          `Za
        dostop do nadzorne plošče se prijavite v svoj račun.`}
      </p>
      <div className="mt-8 flex gap-3">
        {!isAuthenticated && (
          <Button render={<Link href="/login" />}>Prijava</Button>
        )}
        {isAuthenticated && (
          <Button render={<Link href="/dashboard" />} variant="outline">
            Dodeljevanje ur
          </Button>
        )}
      </div>
    </div>
  );
}
