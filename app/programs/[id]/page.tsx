"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { ProgramSubjectsTable } from "@/app/programs/_components/program-subjects-table";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProgram } from "@/lib/api";
import type { ProgramWithRelations } from "@/types";

function ProgramDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function ProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = Number(params.id);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [program, setProgram] = useState<ProgramWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || Number.isNaN(programId)) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setProgram(null);

      try {
        const data = await getProgram(programId);

        if (!cancelled) {
          if (!data) {
            setError("Program ni bil najden.");
          } else {
            setProgram(data);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Programa ni bilo mogoče naložiti.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, programId]);

  if (isAuthLoading || !isAuthenticated || isLoading) {
    return (
      <div className="container py-8">
        <ProgramDetailSkeleton />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container py-8">
        <Link
          href="/programs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Nazaj na programe
        </Link>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Program ni na voljo</CardTitle>
            <CardDescription>
              {error ?? "Program ni bil najden."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Nazaj na programe
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <GraduationCap className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {program.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Urejanje programa
          </p>
        </div>

        {program.programYears.length > 0 && (
          <Card className="overflow-hidden py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Letniki</CardTitle>
              <CardDescription>
                Pregled letnikov in razredov v programu.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 p-4">
              {[...program.programYears]
                .sort((a, b) => a.yearId - b.yearId)
                .map((programYear) => (
                  <div
                    key={programYear.yearId}
                    className="min-w-[140px] flex-1 rounded-lg border bg-muted p-3 "
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">
                          {programYear.year.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {programYear.numWeeks} tednov
                        </p>
                      </div>
                    </div>

                    {programYear.classes.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <p className="text-sm font-medium">Oddelki: </p>
                        {programYear.classes.map((programClass) => (
                          <Badge
                            key={programClass.id}
                            variant="outline"
                            className="font-normal"
                          >
                            {programClass.label.label.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        <ProgramSubjectsTable program={program} />
      </div>
    </div>
  );
}
