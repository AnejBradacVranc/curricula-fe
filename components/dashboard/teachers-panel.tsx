"use client";

import { useState } from "react";
import { Clock, GripVertical, Mail, Users } from "lucide-react";
import { TeacherDetailDialog } from "@/components/dashboard/teacher-detail-dialog";
import { setTeacherDragData } from "@/components/dashboard/drag";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasTeacherColor } from "@/lib/teacher-color";
import type { Teacher } from "@/types";

type TeachersPanelProps = {
  teachers: Teacher[];
  draggingTeacherId: number | null;
  onDragStart: (teacherId: number) => void;
  onDragEnd: () => void;
  onTeacherUpdated?: () => void;
};

export function TeachersPanel({
  teachers,
  draggingTeacherId,
  onDragStart,
  onDragEnd,
  onTeacherUpdated,
}: TeachersPanelProps) {
  const [detailTeacherId, setDetailTeacherId] = useState<number | null>(null);

  return (
    <>
      <Card className="flex h-full min-h-0 flex-col lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Učitelji
            </CardTitle>
            <Badge variant="secondary">{teachers.length}</Badge>
          </div>
          <CardDescription>
            Povlecite učitelja na predmet za dodelitev ali kliknite za podrobnosti.
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-0">
          {teachers.length === 0 ? (
            <p className="px-(--card-spacing) py-8 text-center text-sm text-muted-foreground">
              Ni registriranih učiteljev.
            </p>
          ) : (
            <ScrollArea className="h-full max-h-[min(70vh,640px)]">
              <ul className="divide-y divide-border">
                {teachers.map((teacher) => (
                  <li key={teacher.id}>
                    <div
                      className={cn(
                        "flex items-center  px-(--card-spacing) py-2 transition-opacity",
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
                        className="cursor-pointer flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <div className="min-w-0 flex-1 overflow-hidden space-y-1">
                          <p className="flex min-w-0 items-center gap-2 truncate font-medium">
                            {hasTeacherColor(teacher.color) ? (
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

                          <div className="flex flex-col items-end gap-0.5 text-[11px] text-muted-foreground leading-tight">
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

                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>

        {teachers.length > 0 && (
          <>
            <Separator />
            <div className="px-(--card-spacing) py-3 text-xs text-muted-foreground">
              Skupaj ur:{" "}
              <span className="font-medium text-foreground">
                {teachers.reduce(
                  (sum, teacher) => sum + Number(teacher.totalHours),
                  0,
                )}
                h
              </span>
            </div>
          </>
        )}
      </Card>

      <TeacherDetailDialog
        teacherId={detailTeacherId}
        open={detailTeacherId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTeacherId(null);
          }
        }}
        onTeacherUpdated={onTeacherUpdated}
      />
    </>
  );
}
