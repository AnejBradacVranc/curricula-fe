"use client";

import { useMemo, useState } from "react";
import { Clock, GripVertical, Mail, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasColor } from "@/lib/teacher-color";
import type { AdditionalActivity, Teacher } from "@/types";
import { TeacherDetailDialog } from "./teacher-detail-dialog";
import { setTeacherDragData } from "./drag";

type TeachersPanelProps = {
  teachers: Teacher[];
  additionalActivities: AdditionalActivity[];
  draggingTeacherId: number | null;
  onDragStart: (teacherId: number) => void;
  onDragEnd: () => void;
};

export function TeachersPanel({
  teachers,
  additionalActivities,
  draggingTeacherId,
  onDragStart,
  onDragEnd,
}: TeachersPanelProps) {
  const [detailTeacherId, setDetailTeacherId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const fullName = `${teacher.name} ${teacher.surname}`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        teacher.email.toLowerCase().includes(normalized)
      );
    });
  }, [teachers, query]);

  return (
    <>
      <Card className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden py-0">
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
              Povlecite učitelja na predmet za dodelitev ali kliknite za
              podrobnosti.
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
          {filteredTeachers.length === 0 ? (
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
                      className={cn(
                        "flex items-center rounded-md transition-opacity",
                        draggingTeacherId === teacher.id && "opacity-50",
                      )}
                    >
                      <div
                        draggable
                        onDragStart={(event) => {
                          setTeacherDragData(event.dataTransfer, {
                            id: teacher.id,
                            name: teacher.name,
                            surname: teacher.surname,
                            color: teacher.color,
                          });
                          onDragStart(teacher.id);
                        }}
                        onDragEnd={onDragEnd}
                        className="flex shrink-0 cursor-grab items-center self-stretch rounded-md px-1 text-primary hover:bg-primary/10 active:cursor-grabbing"
                        aria-label={`Povleci ${teacher.name} ${teacher.surname}`}
                      >
                        <GripVertical className="size-4" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailTeacherId(teacher.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
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
                          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant="default" className="gap-1.5">
                            <Clock className="size-3" />
                            <span className="font-medium text-foreground tabular-nums">
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
                                  {formatHours(teacher.additionalActivityHours)}
                                  h
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
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
