"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTeacher } from "@/lib/api";
import type { Teacher } from "@/types";

type DeleteTeacherDialogProps = {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void | Promise<void>;
};

export function DeleteTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTeacherDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const teacherLabel = teacher
    ? `${teacher.name} ${teacher.surname}`
    : null;

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  async function handleDelete() {
    if (!teacher) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteTeacher(teacher.id);
      toast.success("Učitelj je bil uspešno izbrisan.", {
        description: teacherLabel ?? undefined,
      });
      onOpenChange(false);
      await onDeleted?.();
    } catch {
      setError("Učitelja ni bilo mogoče izbrisati. Poskusite znova.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izbriši učitelja</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati učitelja{" "}
            <span className="font-medium text-foreground">{teacherLabel}</span>?
            S tem boste odstranili tudi vse dodelitve temu učitelju v programih
            in dodatne dejavnosti, če obstajajo. Tega dejanja ni mogoče
            razveljaviti.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Prekliči
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            <Trash2 />
            {isDeleting ? "Brisanje..." : "Izbriši učitelja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
