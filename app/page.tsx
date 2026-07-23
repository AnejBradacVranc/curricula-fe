"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { navLinks } from "@/components/navigation/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const hubLinks = navLinks.filter((link) => link.auth);

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">
        Curricula
      </h1>
      <p className="mt-2 text-2xl text-muted-foreground">
        Aplikacija za beleženje ur učiteljem
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : isAuthenticated ? (
        <>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Izberite, kam želite nadaljevati.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hubLinks.map(({ href, label, description, icon: Icon }) => (
              <Link key={href} href={href} className="group block">
                <Card className="h-full transition-colors group-hover:bg-muted/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="size-4 text-primary" />
                      {label}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Upravljajte dodeljene ure za učitelje. Za dostop do nadzorne plošče
            se prijavite v svoj račun.
          </p>
          <div className="mt-8">
            <Button render={<Link href="/login" />}>Prijava</Button>
          </div>
        </>
      )}
    </div>
  );
}
