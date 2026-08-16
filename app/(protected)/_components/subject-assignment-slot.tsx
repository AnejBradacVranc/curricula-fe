"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hasColor, colorWithOpacity } from "@/lib/teacher-color";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/types";
import { getTeacherDragData } from "./drag";

type SubjectTeacher = Omit<Teacher, "schoolId">;

type SubjectAssignmentSlotProps = {
  teacher?: SubjectTeacher;
  isPending: boolean;
  disabled?: boolean;
  onAssign: (teacherId: number) => void;
  onRemove: () => void;
  onClick: () => void;
};

export function SubjectAssignmentSlot({
  teacher,
  isPending,
  disabled = false,
  onAssign,
  onRemove,
  onClick,
}: SubjectAssignmentSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || isPending) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
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
    const teacherColor = hasColor(teacher.color) ? teacher.color : null;

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={
          teacherColor
            ? { backgroundColor: colorWithOpacity(teacherColor, 0.2) }
            : undefined
        }
        className={cn(
          "flex items-center gap-2 rounded-lg text-sm transition-colors",
          "px-2 py-1 text-[10px]",
          !teacherColor && "bg-muted/60",
          isPending && "opacity-60",
          isDragOver &&
          (teacherColor
            ? "ring-2 ring-primary/40"
            : "border-primary bg-primary/10 text-foreground"),
        )}
      >
        {teacherColor ? (
          <span
            className="size-2 shrink-0 rounded-full ring-1 ring-foreground/10"
            style={{ backgroundColor: teacherColor }}
            aria-hidden
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate font-medium">
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
      onClick={() => {
        if (disabled || isPending) {
          return;
        }
        onClick();
      }}
      className={cn(
        "rounded-lg border border-dashed text-muted-foreground transition-colors",
        "px-2 py-1 text-[10px]",
        !disabled &&
          !isPending &&
          "cursor-pointer hover:border-primary/40 hover:bg-primary/5",
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
        "Klikni ali povleci"
      )}
    </div>
  );
}
