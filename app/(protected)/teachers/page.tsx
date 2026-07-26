"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, FileUp, Mail, Trash2, Users } from "lucide-react";

import { DeleteTeacherDialog } from "@/app/(protected)/teachers/_components/delete-teacher-dialog";
import { ExtractTeachersDialog } from "@/app/(protected)/teachers/_components/extract-teachers-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeachers } from "@/lib/api";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasColor } from "@/lib/teacher-color";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/types";

function TeachersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const refreshTeachers = async () => {
    try {
      const teachersData = await getTeachers();
      setTeachers(teachersData);
      setError(null);
    } catch {
      setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const teachersData = await getTeachers();
        if (!cancelled) {
          setTeachers(teachersData);
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

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <TeachersSkeleton />
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
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="size-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Učitelji</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Seznam učiteljev na šoli. Uvozite jih iz datoteke ali jih dodajte
              posamično.
            </p>
          </div>

          <Button type="button" onClick={() => setIsExtractOpen(true)}>
            <FileUp />
            Uvoz
          </Button>
        </div>

        <Card className="overflow-hidden py-0">
          {teachers.length === 0 ? (
            <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
              Šola še nima dodanih učiteljev. Uvozite jih iz datoteke.
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {teachers.map((teacher) => (
                  <li
                    key={teacher.id}
                    className="group flex items-center hover:bg-muted/50"
                  >
                    <Link
                      href={`/teachers/${teacher.id}`}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-4 px-4 py-3 transition-colors",
                        "focus-visible:bg-muted/50 focus-visible:outline-none",
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="flex min-w-0 items-center gap-2 truncate font-medium group-hover:text-primary">
                          {hasColor(teacher.color) ? (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-border"
                              style={{ backgroundColor: teacher.color! }}
                              aria-hidden
                            />
                          ) : null}
                          <span className="truncate">
                            {teacher.name} {teacher.surname}
                          </span>
                        </p>
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">{teacher.email}</span>
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1.5">
                        <Clock className="size-3" />
                        {formatHours(teacher.totalHours)}h
                      </Badge>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                    <div className="shrink-0 pr-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Izbriši ${teacher.name} ${teacher.surname}`}
                        onClick={() => setTeacherToDelete(teacher)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </div>

      <ExtractTeachersDialog
        open={isExtractOpen}
        onOpenChange={setIsExtractOpen}
        onExtracted={refreshTeachers}
      />

      <DeleteTeacherDialog
        teacher={teacherToDelete}
        open={teacherToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTeacherToDelete(null);
          }
        }}
        onDeleted={refreshTeachers}
      />
    </div>
  );
}
