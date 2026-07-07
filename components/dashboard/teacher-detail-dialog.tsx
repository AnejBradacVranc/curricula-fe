"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeacher } from "@/lib/api";
import { formatHours } from "@/lib/curriculum/format-hours";
import type { TeacherDetail } from "@/types";

type TeacherDetailDialogProps = {
  teacherId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function TeacherDetailSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export function TeacherDetailDialog({
  teacherId,
  open,
  onOpenChange,
}: TeacherDetailDialogProps) {
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || teacherId === null) {
      return;
    }

    const selectedTeacherId = teacherId;
    let cancelled = false;

    async function loadTeacher() {
      setIsLoading(true);
      setError(null);
      setTeacher(null);

      try {
        const data = await getTeacher(selectedTeacherId);
        if (!cancelled) {
          setTeacher(data);
        }
      } catch {
        if (!cancelled) {
          setError("Podatkov o učitelju ni bilo mogoče naložiti.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTeacher();

    return () => {
      cancelled = true;
    };
  }, [open, teacherId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {isLoading ? (
          <>
            <DialogHeader className="border-b px-4 pt-4 pb-3">
              <DialogTitle>Nalaganje učitelja</DialogTitle>
              <DialogDescription>Prosimo počakajte …</DialogDescription>
            </DialogHeader>
            <TeacherDetailSkeleton />
          </>
        ) : error ? (
          <>
            <DialogHeader className="border-b px-4 pt-4 pb-3">
              <DialogTitle>Napaka</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
          </>
        ) : teacher ? (
          <>
            <DialogHeader className="border-b px-4 pt-4 pb-3">
              <div className="flex items-start justify-between gap-3 pr-8">
                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-lg">
                    {teacher.name} {teacher.surname}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5">
                    <Mail className="size-3.5 shrink-0" />
                    {teacher.email}
                  </DialogDescription>
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <Clock className="size-3" />
                  {formatHours(teacher.assignedHours)}h
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium">
                <BookOpen className="size-4 text-primary" />
                Dodelitve ({teacher.assignments.length})
              </div>

              {teacher.assignments.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-muted-foreground">
                  Ta učitelj še nima dodeljenih predmetov.
                </p>
              ) : (
                <ScrollArea className="max-h-[min(50vh,360px)] px-4 pb-4">
                  <ul className="divide-y divide-border rounded-lg border">
                    {teacher.assignments.map((assignment, index) => {
                      const { class: classRoom, programSubject } = assignment;
                      const assignmentKey = [
                        classRoom.programYear.year.name,
                        classRoom.label.label,
                        programSubject.subject.name,
                        index,
                      ].join("-");

                      return (
                        <li
                          key={assignmentKey}
                          className="space-y-1 px-3 py-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium">
                              {programSubject.subject.name}
                            </p>
                            <Badge variant="outline" className="shrink-0">
                              {formatHours(programSubject.requiredHours)} h/teden
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {classRoom.programYear.year.name} · razred{" "}
                            {classRoom.label.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {programSubject.subject.category.name}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </>
        ) : (
          <DialogHeader className="px-4 py-4">
            <DialogTitle>Učitelj ni najden</DialogTitle>
            <DialogDescription>
              Izbranega učitelja ni mogoče prikazati.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
