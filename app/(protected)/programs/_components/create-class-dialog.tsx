"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass } from "@/lib/api";
import type { ProgramYear } from "@/types";

type CreateClassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programYear: ProgramYear | null;
  onCreated?: () => void | Promise<void>;
};

export function CreateClassDialog({
  open,
  onOpenChange,
  programId,
  programYear,
  onCreated,
}: CreateClassDialogProps) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setLabel("");
      setError(null);
      setIsSubmitting(false);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!programYear) {
      return;
    }

    const trimmedLabel = label.trim().toLowerCase();

    if (!trimmedLabel) {
      setError("Vnesite oznako razreda.");
      return;
    }

    if (
      programYear.classes.some(
        (item) => item.label.toLowerCase() === trimmedLabel,
      )
    ) {
      setError("Razred s to oznako že obstaja.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createClass({
        programId,
        yearId: programYear.yearId,
        label: trimmedLabel,
      });
      toast.success("Razred je bil uspešno dodan.", {
        description: `${programYear.year.name.slice(0, 1)}. ${created.label.toUpperCase()}`,
      });
      handleOpenChange(false);
      await onCreated?.();
    } catch {
      setError("Razreda ni bilo mogoče dodati. Poskusite znova.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj razred</DialogTitle>
          <DialogDescription>
            {programYear
              ? `Vnesite oznako razreda za ${programYear.year.name} (npr. a, b, bt).`
              : "Vnesite oznako razreda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-label">Oznaka</Label>
            <Input
              id="class-label"
              placeholder="npr. a"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={isSubmitting}
              autoFocus
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
            <Button type="submit" disabled={isSubmitting || !label.trim()}>
              <Plus />
              {isSubmitting ? "Dodajanje..." : "Dodaj razred"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
