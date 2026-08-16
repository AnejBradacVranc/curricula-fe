"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, FileUp, Mail, Trash2, Users } from "lucide-react";

import { DeleteTeacherDialog } from "@/app/(protected)/teachers/_components/delete-teacher-dialog";
import { ExtractTeachersDialog } from "@/app/(protected)/teachers/_components/extract-teachers-dialog";
import { TeacherAvatar } from "@/app/(protected)/teachers/_components/teacher-avatar";
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
import { formatHours } from "@/lib/curriculum/format-hours";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTeachers } from "@/lib/queries/teachers/queries";
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
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const isMobile = useIsMobile();

  const {
    data: teachers = [],
    isLoading,
    isError,
  } = useTeachers();

  if (isLoading) {
    return (
      <div className="container py-8">
        <TeachersSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>
              Podatkov ni bilo mogoče naložiti. Poskusite znova.
            </CardDescription>
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
              <h1 className="text-2xl font-semibold tracking-tight">
                Učitelji
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Seznam učiteljev na šoli. Uvozite jih iz datoteke ali jih dodajte
              posamično.
            </p>
          </div>

          <div className={cn("space-x-2", isMobile && "flex self-end")}>
            <Button type="button" onClick={() => setIsExtractOpen(true)}>
              <FileUp />
              {!isMobile && "Uvozi"}
            </Button>
          </div>
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
                        "flex min-w-0 flex-1 items-center gap-4 px-4 py-4 transition-colors",
                        "focus-visible:bg-muted/50 focus-visible:outline-none",
                      )}
                    >
                      <TeacherAvatar
                        name={teacher.name}
                        surname={teacher.surname}
                        profileImage={teacher.profileImage}
                        color={teacher.color}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <Badge
                          variant="secondary"
                          className="gap-1.5 md:hidden flex"
                        >
                          <Clock className="size-3" />
                          {formatHours(teacher.totalHours)}h
                        </Badge>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {teacher.name} {teacher.surname}
                        </p>
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3 shrink-0" />
                          <span>{teacher.email}</span>
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="gap-1.5 hidden md:flex"
                      >
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
      />

      <DeleteTeacherDialog
        teacher={teacherToDelete}
        open={teacherToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTeacherToDelete(null);
          }
        }}
      />
    </div>
  );
}
