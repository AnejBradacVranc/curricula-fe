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
import { deleteProgram } from "@/lib/api";
import type { ProgramWithRelations } from "@/types";

type DeleteProgramDialogProps = {
  program: ProgramWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (programId: number) => void;
};

export function DeleteProgramDialog({
  program,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProgramDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  async function handleDelete() {
    if (!program) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteProgram(program.id);
      toast.success("Program je bil uspešno izbrisan.", {
        description: program.name,
      });
      onDeleted(program.id);
      onOpenChange(false);
    } catch {
      setError("Programa ni bilo mogoče izbrisati. Poskusite znova.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izbriši program</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati program{" "}
            <span className="font-medium text-foreground">
              {program?.name}
            </span>
            ? Tega dejanja ni mogoče razveljaviti.
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
            {isDeleting ? "Brisanje..." : "Izbriši program"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
