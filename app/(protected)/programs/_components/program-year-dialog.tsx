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
import {
  useCreateProgramYear,
  useUpdateProgramYear,
} from "@/lib/queries/program-years/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useYears } from "@/lib/queries/years/queries";
import type { ProgramYear } from "@/types";

type ProgramYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  editingProgramYear: ProgramYear | null;
};

export function ProgramYearDialog({
  open,
  onOpenChange,
  programId,
  editingProgramYear,
}: ProgramYearDialogProps) {
  const { data: program } = useProgram(programId);
  const { data: years = [] } = useYears({ enabled: open });
  const createProgramYearMutation = useCreateProgramYear();
  const updateProgramYearMutation = useUpdateProgramYear();

  const programYears = program?.programYears ?? [];
  const isEditing = editingProgramYear !== null;

  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [numWeeks, setNumWeeks] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectableYears = useMemo(() => {
    if (isEditing) {
      return years;
    }

    const assignedYearIds = new Set(programYears.map((item) => item.yearId));
    return years.filter((year) => !assignedYearIds.has(year.id));
  }, [isEditing, programYears, years]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError(null);
    setSelectedYearId(editingProgramYear?.yearId ?? null);
    setNumWeeks(editingProgramYear ? String(editingProgramYear.numWeeks) : "");
  }, [open, editingProgramYear]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValidationError(null);
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

    try {
      if (isEditing) {
        await updateProgramYearMutation.mutateAsync({
          programId,
          yearId: selectedYearId,
          numWeeks: weeks,
        });
        toast.success("Letnik je bil uspešno posodobljen.");
      } else {
        await createProgramYearMutation.mutateAsync({
          programId,
          yearId: selectedYearId,
          numWeeks: weeks,
        });
        toast.success("Letnik je bil uspešno dodan.");
      }

      handleOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? "Letnika ni bilo mogoče posodobiti. Poskusite znova."
          : "Letnika ni bilo mogoče dodati. Poskusite znova.",
      );
    }
  }

  const isSubmitting =
    createProgramYearMutation.isPending || updateProgramYearMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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
      </DialogContent>
    </Dialog>
  );
}
