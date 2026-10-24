"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Clock,
  GripVertical,
  Mail,
  Search,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdditionalActivities } from "@/lib/queries/additional-activities/queries";
import { useTeachers } from "@/lib/queries/teachers/queries";
import { cn } from "@/lib/utils";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasColor } from "@/lib/teacher-color";
import { TeacherDetailDialog } from "./teacher-detail-dialog";
import { setTeacherDragData } from "./drag";

export function TeachersPanel() {
  const [detailTeacherId, setDetailTeacherId] = useState<number | null>(null);
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );
  const [query, setQuery] = useState("");

  const {
    data: teachers = [],
    isLoading: teachersLoading,
    isError: teachersError,
  } = useTeachers();
  const { data: additionalActivities = [] } = useAdditionalActivities();

  const filteredTeachers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const fullName = `${teacher.name} ${teacher.surname}`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        (teacher.email?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [teachers, query]);

  return (
    <>
      <Card className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden py-0 lg:max-h-full">
        <CardHeader className="shrink-0 space-y-3 border-b py-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" />
                Učitelji
              </CardTitle>
              <Badge variant="secondary">{filteredTeachers.length}</Badge>
            </div>
            <CardDescription>
              Povlecite učitelja na predmet za dodelitev.
            </CardDescription>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Išči po imenu ali e-pošti …"
              className="pl-8"
              aria-label="Išči učitelje"
            />
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          {teachersLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : teachersError ? (
            <p className="px-(--card-spacing) py-8 text-center text-sm text-destructive">
              Učiteljev ni bilo mogoče naložiti.
            </p>
          ) : filteredTeachers.length === 0 ? (
            <p className="px-(--card-spacing) py-8 text-center text-sm text-muted-foreground">
              {teachers.length === 0
                ? "Ni registriranih učiteljev."
                : "Noben učitelj ne ustreza iskanju."}
            </p>
          ) : (
            <div className="h-full overflow-y-auto overscroll-y-contain">
              <ul className="divide-y divide-border p-1">
                {filteredTeachers.map((teacher) => (
                  <li key={teacher.id}>
                    <div
                      draggable
                      onDragStart={(event) => {
                        setTeacherDragData(event.dataTransfer, {
                          id: teacher.id,
                          name: teacher.name,
                          surname: teacher.surname,
                          color: teacher.color,
                        });
                        setDraggingTeacherId(teacher.id);
                      }}
                      onDragEnd={() => setDraggingTeacherId(null)}
                      aria-label={`Povleci ${teacher.name} ${teacher.surname}`}
                      className={cn(
                        "flex cursor-grab items-center gap-2 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60 active:cursor-grabbing",
                        draggingTeacherId === teacher.id && "opacity-50",
                      )}
                    >
                      <GripVertical className="size-4 shrink-0 text-primary" />

                      <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                        <p className="flex min-w-0 items-center gap-2 truncate font-medium">
                          {hasColor(teacher.color) ? (
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-border"
                              style={{ backgroundColor: teacher.color }}
                              aria-hidden
                            />
                          ) : null}
                          <span className="truncate">
                            {teacher.name} {teacher.surname}
                          </span>
                        </p>
                        {teacher.email ? (
                          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </p>
                        ) : null}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          data-no-drag
                          className="h-auto cursor-pointer px-0 text-xs mt-2"
                          draggable={false}
                          onClick={() => setDetailTeacherId(teacher.id)}
                        >
                          Prikaži več
                          <ArrowRight />
                        </Button>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant="default" className="gap-1.5">
                          <Clock className="size-3" />
                          <span className="font-medium text-primary-foreground tabular-nums">
                            {formatHours(teacher.totalHours)}h
                          </span>
                        </Badge>

                        <div className="flex flex-col items-end gap-0.5 text-[11px] leading-tight text-muted-foreground">
                          <span className="whitespace-nowrap">
                            Predmeti{" "}
                            <span className="font-medium text-foreground tabular-nums">
                              {formatHours(teacher.assignedHours)}h
                            </span>
                          </span>

                          {Number(teacher.additionalActivityHours) > 0 && (
                            <span className="whitespace-nowrap">
                              Dodatno{" "}
                              <span className="font-medium text-foreground tabular-nums">
                                {formatHours(teacher.additionalActivityHours)}h
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherDetailDialog
        teacherId={detailTeacherId}
        open={detailTeacherId !== null}
        additionalActivities={additionalActivities}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTeacherId(null);
          }
        }}
      />
    </>
  );
}
