"use client";

import { useState } from "react";
import { Loader2, UserRound, X } from "lucide-react";
import { getTeacherDragData } from "@/components/dashboard/drag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/types";

type SubjectTeacher = Omit<Teacher, "schoolId">;

type SubjectAssignmentSlotProps = {
  teacher?: SubjectTeacher;
  isPending: boolean;
  disabled?: boolean;
  onAssign: (teacherId: number) => void;
  onRemove: () => void;
};

export function SubjectAssignmentSlot({
  teacher,
  isPending,
  disabled = false,
  onAssign,
  onRemove,
}: SubjectAssignmentSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || isPending) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
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

  if (teacher) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm transition-colors",
          isPending && "opacity-60",
          isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      >
        <UserRound className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          {teacher.name} {teacher.surname}
        </span>
        {isPending ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label={`Odstrani ${teacher.name} ${teacher.surname}`}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors",
        !disabled &&
          !isPending &&
          "cursor-copy hover:border-primary/40 hover:bg-primary/5",
        isDragOver && "border-primary bg-primary/10 text-foreground",
        isPending && "opacity-60",
      )}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Dodeljevanje...
        </span>
      ) : (
        "Povlecite učitelja sem"
      )}
    </div>
  );
}
