"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";

import { CreateProgramDialog } from "@/app/programs/_components/create-program-dialog";
import { DeleteProgramDialog } from "@/app/programs/_components/delete-program-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPrograms } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ProgramWithRelations } from "@/types";

function ProgramsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              {index < 3 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProgramsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [programToDelete, setProgramToDelete] =
    useState<ProgramWithRelations | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadPrograms() {
      setIsLoading(true);
      setError(null);

      try {
        const programsData = await getPrograms();

        if (!cancelled) {
          setPrograms(programsData);
        }
      } catch {
        if (!cancelled) {
          setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPrograms();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated]);

  if (isAuthLoading || !isAuthenticated || isLoading) {
    return (
      <div className="container py-8">
        <ProgramsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Programi</h1>
            <p className="text-sm text-muted-foreground">
              Izberite program za ogled in urejanje izvedbenega predmetnika.
            </p>
          </div>

          <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer">
            <Plus />
            Nov program
          </Button>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" />
                Ni programov
              </CardTitle>
              <CardDescription>
                Ustvarite prvi program za vašo šolo. Nato boste lahko dodali
                letnike, razrede in predmete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus />
                Ustvari program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  Vsi programi
                </CardTitle>
                <Badge variant="secondary">{programs.length}</Badge>
              </div>
              <CardDescription>
                Kliknite program za odprtje podrobnosti.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {programs.map((program) => {
                  const yearCount = program.programYears.length;
                  const subjectCount = new Set(
                    program.programSubjects.map((item) => item.subjectId),
                  ).size;

                  return (
                    <li
                      key={program.id}
                      className="group flex items-center hover:bg-muted/50"
                    >
                      <Link
                        href={`/programs/${program.id}`}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-4 px-4 py-4 transition-colors",
                          "focus-visible:bg-muted/50 focus-visible:outline-none",
                        )}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <GraduationCap className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate font-medium group-hover:text-primary">
                            {program.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Layers className="size-3" />
                              {yearCount}{" "}
                              {yearCount === 1 ? "letnik" : "letniki"}
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="size-3" />
                              {subjectCount}{" "}
                              {subjectCount === 1 ? "predmet" : "predmeti"}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mr-3 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Izbriši program ${program.name}`}
                        onClick={() => setProgramToDelete(program)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateProgramDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <DeleteProgramDialog
        program={programToDelete}
        open={programToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setProgramToDelete(null);
          }
        }}
        onDeleted={(programId) => {
          setPrograms((current) =>
            current.filter((item) => item.id !== programId),
          );
          setProgramToDelete(null);
        }}
      />
    </div>
  );
}
