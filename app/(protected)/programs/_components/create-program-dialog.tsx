"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProgram } from "@/lib/queries/programs/mutations";

type CreateProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProgramDialog({
  open,
  onOpenChange,
}: CreateProgramDialogProps) {
  const router = useRouter();
  const createProgramMutation = useCreateProgram();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Vnesite ime programa.");
      return;
    }

    setError(null);

    try {
      const program = await createProgramMutation.mutateAsync({
        name: trimmedName,
      });
      handleOpenChange(false);
      router.push(`/programs/${program.id}`);
    } catch {
      setError("Programa ni bilo mogoče ustvariti. Poskusite znova.");
    }
  }

  const isSubmitting = createProgramMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj program</DialogTitle>
          <DialogDescription>
            Vnesite ime programa. Po ustvaritvi boste lahko dodali letnike,
            razrede in predmete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">Ime programa</Label>
            <Input
              id="program-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="npr. Gradbeni tehnik"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Prekliči
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus />
              {isSubmitting ? "Ustvarjanje..." : "Ustvari program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
