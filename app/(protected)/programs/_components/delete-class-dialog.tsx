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
import { deleteClass } from "@/lib/api";
import type { ProgramClass, ProgramYear } from "@/types";

type DeleteClassTarget = {
  programYear: ProgramYear;
  programClass: ProgramClass;
};

type DeleteClassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  target: DeleteClassTarget | null;
  onDeleted?: () => void | Promise<void>;
};

export function DeleteClassDialog({
  open,
  onOpenChange,
  programId,
  target,
  onDeleted,
}: DeleteClassDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const classLabel = target
    ? `${target.programYear.year.name.slice(0, 1)}. ${target.programClass.label.toUpperCase()}`
    : null;

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  async function handleDelete() {
    if (!target) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteClass({
        id: target.programClass.id,
        programId,
        yearId: target.programYear.yearId,
      });
      toast.success("Razred je bil uspešno izbrisan.", {
        description: classLabel ?? undefined,
      });
      onOpenChange(false);
      await onDeleted?.();
    } catch {
      setError("Razreda ni bilo mogoče izbrisati. Poskusite znova.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izbriši razred</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati razred{" "}
            <span className="font-medium text-foreground">{classLabel}</span>?
            S tem boste odstranili tudi vse dodelitve učiteljev temu razredu, če
            obstajajo. Tega dejanja ni mogoče razveljaviti.
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
            {isDeleting ? "Brisanje..." : "Izbriši razred"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
