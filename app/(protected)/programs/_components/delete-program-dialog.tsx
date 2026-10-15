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
import { useDeleteProgram } from "@/lib/queries/programs/mutations";
import type { ProgramLean } from "@/types/entities/program";

type DeleteProgramDialogProps = {
  program: ProgramLean | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProgramDialog({
  program,
  open,
  onOpenChange,
}: DeleteProgramDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteProgramMutation = useDeleteProgram();

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  async function handleDelete() {
    if (!program) {
      return;
    }

    setError(null);

    try {
      await deleteProgramMutation.mutateAsync(program.id);
      toast.success("Program je bil uspešno izbrisan.", {
        description: program.name,
      });
      onOpenChange(false);
    } catch {
      setError("Programa ni bilo mogoče izbrisati. Poskusite znova.");
    }
  }

  const isDeleting = deleteProgramMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izbriši program</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati program{" "}
            <span className="font-medium text-foreground">{program?.name}</span>
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
