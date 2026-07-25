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
import { deleteProgramSubject } from "@/lib/api";
import type { ProgramSubjectItem } from "@/types";

type DeleteProgramSubjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programSubject: ProgramSubjectItem | null;
  onDeleted?: () => void | Promise<void>;
};

export function DeleteProgramSubjectDialog({
  open,
  onOpenChange,
  programId,
  programSubject,
  onDeleted,
}: DeleteProgramSubjectDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectLabel = programSubject
    ? `${programSubject.subject.name} (${programSubject.programYear.year.name})`
    : null;

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  async function handleDelete() {
    if (!programSubject) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteProgramSubject({
        programId,
        subjectId: programSubject.subjectId,
        yearId: programSubject.yearId,
      });
      toast.success("Predmet je bil uspešno odstranjen iz programa.", {
        description: subjectLabel ?? undefined,
      });
      onOpenChange(false);
      await onDeleted?.();
    } catch {
      setError("Predmeta ni bilo mogoče odstraniti. Poskusite znova.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odstrani predmet</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite odstraniti predmet{" "}
            <span className="font-medium text-foreground">{subjectLabel}</span>{" "}
            iz programa? S tem boste odstranili tudi vse dodelitve učiteljev temu
            predmetu, če obstajajo. Tega dejanja ni mogoče razveljaviti.
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
            {isDeleting ? "Brisanje..." : "Odstrani predmet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
