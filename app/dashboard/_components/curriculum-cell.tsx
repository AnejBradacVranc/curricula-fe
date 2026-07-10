"use client";

import { Loader2 } from "lucide-react";

import { formatHours } from "@/lib/curriculum/format-hours";
import { findAssignmentForClass } from "@/lib/curriculum/build-curriculum-rows";
import type { ProgramClass, ProgramSubjectItem } from "@/types";
import { SubjectAssignmentSlot } from "./subject-assignment-slot";

type CurriculumCellProps = {
  programSubject?: ProgramSubjectItem;
  classes: ProgramClass[];
  pendingClassId: number | null;
  disabled?: boolean;
  onAssign: (classId: number, teacherId: number) => void;
  onRemove: (classId: number, teacherId: number) => void;
};

export function CurriculumCell({
  programSubject,
  classes,
  pendingClassId,
  disabled = false,
  onAssign,
  onRemove,
}: CurriculumCellProps) {
  if (!programSubject) {
    return <span className="block text-center text-muted-foreground">—</span>;
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-1 p-1.5">
        <div className="text-center text-sm font-semibold tabular-nums">
          {formatHours(programSubject.requiredHours)}
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Ni razredov
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-16 space-y-1.5 p-1.5">
      <div className="text-center text-sm font-semibold tabular-nums">
        {formatHours(programSubject.requiredHours)}
      </div>

      <div className="space-y-1">
        {classes.map((programClass) => {
          const assignment = findAssignmentForClass(
            programSubject,
            programClass.id,
          );
          const isPending = pendingClassId === programClass.id;

          return (
            <div key={programClass.id} className="space-y-0.5">
              <p className="px-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {programClass.label.label}
              </p>
              {isPending ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed px-2 py-1">
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SubjectAssignmentSlot
                  teacher={assignment?.teacher}
                  isPending={false}
                  disabled={
                    disabled ||
                    (pendingClassId !== null && pendingClassId !== programClass.id)
                  }
                  onAssign={(teacherId) => onAssign(programClass.id, teacherId)}
                  onRemove={() => {
                    if (!assignment) {
                      return;
                    }

                    onRemove(programClass.id, assignment.teacherId);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
