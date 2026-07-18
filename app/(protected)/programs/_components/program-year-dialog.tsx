"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createProgramYear,
  getYears,
  updateProgramYear,
} from "@/lib/api";
import type { ProgramYear } from "@/types";

type ProgramYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programYears: ProgramYear[];
  editingProgramYear: ProgramYear | null;
  onProgramYearSaved?: () => void | Promise<void>;
};

function ProgramYearDialogSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function ProgramYearDialog({
  open,
  onOpenChange,
  programId,
  programYears,
  editingProgramYear,
  onProgramYearSaved,
}: ProgramYearDialogProps) {
  const isEditing = editingProgramYear !== null;

  const [availableYears, setAvailableYears] = useState<
    Awaited<ReturnType<typeof getYears>>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [numWeeks, setNumWeeks] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectableYears = useMemo(() => {
    if (isEditing) {
      return availableYears;
    }

    const assignedYearIds = new Set(programYears.map((item) => item.yearId));

    return availableYears.filter((year) => !assignedYearIds.has(year.id));
  }, [availableYears, isEditing, programYears]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setValidationError(null);
      setIsSubmitting(false);
      setSelectedYearId(editingProgramYear?.yearId ?? null);
      setNumWeeks(
        editingProgramYear ? String(editingProgramYear.numWeeks) : "",
      );

      try {
        const years = await getYears();

        if (!cancelled) {
          setAvailableYears(years);
        }
      } catch {
        if (!cancelled) {
          toast.error("Letnikov ni bilo mogoče naložiti.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, editingProgramYear]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValidationError(null);
      setIsSubmitting(false);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const weeks = Number(numWeeks);

    if (!selectedYearId) {
      setValidationError("Izberite letnik.");
      return;
    }

    if (!Number.isInteger(weeks) || weeks < 1) {
      setValidationError("Vnesite veljavno število tednov (vsaj 1).");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateProgramYear({
          programId,
          yearId: selectedYearId,
          numWeeks: weeks,
        });
        toast.success("Letnik je bil uspešno posodobljen.");
      } else {
        await createProgramYear({
          programId,
          yearId: selectedYearId,
          numWeeks: weeks,
        });
        toast.success("Letnik je bil uspešno dodan.");
      }

      handleOpenChange(false);
      await onProgramYearSaved?.();
    } catch {
      toast.error(
        isEditing
          ? "Letnika ni bilo mogoče posodobiti. Poskusite znova."
          : "Letnika ni bilo mogoče dodati. Poskusite znova.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Urejanje letnika" : "Dodajanje letnika"}
              </DialogTitle>
              <DialogDescription>Prosimo počakajte …</DialogDescription>
            </DialogHeader>
            <ProgramYearDialogSkeleton />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Urejanje letnika" : "Dodajanje letnika"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Posodobite število tednov za izbrani letnik."
                  : "Izberite letnik in nastavite število tednov v šolskem letu."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-year">Letnik</Label>
                <Select
                  value={selectedYearId}
                  onValueChange={setSelectedYearId}
                  disabled={
                    isSubmitting || isEditing || selectableYears.length === 0
                  }
                  modal={false}
                  items={selectableYears.map((year) => ({
                    value: year.id,
                    label: year.name,
                  }))}
                >
                  <SelectTrigger id="program-year" className="w-full">
                    <SelectValue placeholder="Izberite letnik …" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isEditing && editingProgramYear
                      ? [editingProgramYear.year]
                      : selectableYears
                    ).map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-weeks">Število tednov</Label>
                <Input
                  id="num-weeks"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="npr. 35"
                  value={numWeeks}
                  onChange={(event) => setNumWeeks(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {validationError && (
                <p className="text-sm text-destructive" role="alert">
                  {validationError}
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
                  {isEditing ? <Pencil /> : <Plus />}
                  {isSubmitting
                    ? "Shranjevanje..."
                    : isEditing
                      ? "Shrani spremembe"
                      : "Dodaj letnik"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
