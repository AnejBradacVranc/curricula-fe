"use client";

import { useMemo, useState } from "react";
import { Clock, Mail, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasColor } from "@/lib/teacher-color";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/types";

type TeacherSelectDialogProps = {
  teachers: Teacher[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherSelected: (teacherId: number) => void;
};

export function TeacherSelectDialog({
  teachers,
  open,
  onOpenChange,
  onTeacherSelected,
}: TeacherSelectDialogProps) {
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setQuery("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex h-[min(80vh,640px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b px-4 pt-4 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Izberi učitelja
          </DialogTitle>
          <DialogDescription>
            Izberite učitelja za dodelitev v izbrano celico.
          </DialogDescription>

          <div className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Išči po imenu ali e-pošti …"
              className="pl-8"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          {filteredTeachers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {teachers.length === 0
                ? "Ni registriranih učiteljev."
                : "Noben učitelj ne ustreza iskanju."}
            </p>
          ) : (
            <ScrollArea className="h-full">
              <ul className="divide-y divide-border p-1">
                {filteredTeachers.map((teacher) => (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onTeacherSelected(teacher.id);
                        setQuery("");
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                        "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
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

                      <Badge variant="secondary" className="shrink-0 gap-1.5">
                        <Clock className="size-3" />
                        <span className="tabular-nums">
                          {formatHours(teacher.totalHours)}h
                        </span>
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
