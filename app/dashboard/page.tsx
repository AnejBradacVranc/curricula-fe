"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-12">
        <p className="text-muted-foreground">Nalaganje...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nadzorna plošča</CardTitle>
          <CardDescription>
            Uspešno ste prijavljeni. Od tu lahko nadaljujete z delom v aplikaciji.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/" />} variant="outline">
            Nazaj domov
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
