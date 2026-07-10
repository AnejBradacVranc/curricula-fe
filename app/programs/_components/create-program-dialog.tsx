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
import { createProgram } from "@/lib/api";

type CreateProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProgramDialog({
  open,
  onOpenChange,
}: CreateProgramDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setError(null);
    setIsSubmitting(false);
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

    setIsSubmitting(true);
    setError(null);

    try {
      const program = await createProgram({ name: trimmedName });
      handleOpenChange(false);
      router.push(`/programs/${program.id}`);
    } catch {
      setError("Programa ni bilo mogoče ustvariti. Poskusite znova.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nov program</DialogTitle>
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
            <Button type="submit" disabled={isSubmitting} >
              <Plus />
              {isSubmitting ? "Ustvarjanje..." : "Ustvari program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
