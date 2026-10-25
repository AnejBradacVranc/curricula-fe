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
import { formatYearLabel } from "@/lib/curriculum/format-year";
import { useDeleteProgramYear } from "@/lib/queries/program-years/mutations";
import type { ProgramYear } from "@/types";

type DeleteProgramYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programYear: ProgramYear | null;
};

export function DeleteProgramYearDialog({
  open,
  onOpenChange,
  programId,
  programYear,
}: DeleteProgramYearDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteProgramYearMutation = useDeleteProgramYear();

  const yearLabel = programYear
    ? formatYearLabel(programYear.year.year)
    : null;

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  async function handleDelete() {
    if (!programYear) {
      return;
    }

    setError(null);

    try {
      await deleteProgramYearMutation.mutateAsync({
        programId,
        yearId: programYear.yearId,
      });
      toast.success("Letnik je bil uspešno odstranjen iz programa.", {
        description: yearLabel ?? undefined,
      });
      onOpenChange(false);
    } catch {
      setError("Letnika ni bilo mogoče odstraniti. Poskusite znova.");
    }
  }

  const isDeleting = deleteProgramYearMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odstrani letnik</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite odstraniti letnik{" "}
            <span className="font-medium text-foreground">{yearLabel}</span> iz
            programa? S tem boste odstranili tudi razrede, predmete in
            dodelitve učiteljev za ta letnik. Tega dejanja ni mogoče
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
            {isDeleting ? "Brisanje..." : "Odstrani letnik"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
