"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { ProgramSubjectsTable } from "@/app/(protected)/programs/_components/program-subjects-table";
import { ProgramYearsSection } from "@/app/(protected)/programs/_components/program-years-section";
import {
  Card,
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
  const params = useParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<ProgramWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProgram = useCallback(async () => {
    if (Number.isNaN(programId)) {
      return;
    }

    try {
      const data = await getProgram(programId);

      if (!data) {
        setError("Program ni bil najden.");
        setProgram(null);
        return;
      }

      setError(null);
      setProgram(data);
    } catch {
      setError("Programa ni bilo mogoče naložiti.");
    }
  }, [programId]);

  useEffect(() => {
    if (Number.isNaN(programId)) {
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
  }, [programId]);

  if (isLoading) {
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
          <p className="text-sm text-muted-foreground">Urejanje programa</p>
        </div>

        <ProgramYearsSection
          program={program}
          onProgramYearSaved={refreshProgram}
        />

        <ProgramSubjectsTable
          program={program}
          onSubjectSaved={refreshProgram}
        />
      </div>
    </div>
  );
}
