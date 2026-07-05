"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { getTeacherDragData } from "@/components/dashboard/drag";
import { Button } from "@/components/ui/button";
import { formatHours } from "@/lib/curriculum/format-hours";
import { cn } from "@/lib/utils";
import type { ProgramSubjectItem } from "@/types";

type CurriculumCellProps = {
  programSubject?: ProgramSubjectItem;
  isPending: boolean;
  disabled?: boolean;
  onAssign: (teacherId: number) => void;
  onRemove: () => void;
};

export function CurriculumCell({
  programSubject,
  isPending,
  disabled = false,
  onAssign,
  onRemove,
}: CurriculumCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  if (!programSubject) {
    return <span className="block text-center text-muted-foreground">—</span>;
  }

  const teacher = programSubject.teacher;

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || isPending) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled || isPending) {
      return;
    }

    const payload = getTeacherDragData(event.dataTransfer);

    if (!payload) {
      return;
    }

    onAssign(payload.id);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "min-h-16 space-y-1 rounded-md border border-transparent p-1.5 transition-colors",
        !disabled && !isPending && "hover:border-border hover:bg-muted/40",
        isDragOver && "border-primary bg-primary/10",
        isPending && "opacity-60",
      )}
    >
      <div className="text-center text-sm font-semibold tabular-nums">
        {formatHours(programSubject.requiredHours)}
      </div>

      {isPending ? (
        <div className="flex justify-center">
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        </div>
      ) : teacher ? (
        <div className="flex items-center gap-0.5 rounded bg-muted/70 px-1 py-0.5 text-[10px] leading-tight">
          <span className="min-w-0 flex-1 truncate">
            {teacher.name} {teacher.surname}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={`Odstrani ${teacher.name} ${teacher.surname}`}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <p className="text-center text-[10px] leading-tight text-muted-foreground">
          Povleci učitelja
        </p>
      )}
    </div>
  );
}
