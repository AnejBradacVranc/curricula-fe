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
  useCreateProgramSubject,
  useUpdateProgramSubject,
} from "@/lib/queries/program-subjects/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useSubjects } from "@/lib/queries/subjects/queries";
import type { ProgramSubjectItem } from "@/types";

type AssignSubjectDialogProps = {
  open: boolean;
  programId: number;
  editingProgramSubject: ProgramSubjectItem | null;
  onOpenChange: (open: boolean) => void;
};

function getAssignedYearIdsForSubject(
  programSubjects: ProgramSubjectItem[],
  subjectId: number,
) {
  return new Set(
    programSubjects
      .filter((item) => item.subjectId === subjectId)
      .map((item) => item.yearId),
  );
}

export function AssignSubjectDialog({
  open,
  programId,
  editingProgramSubject,
  onOpenChange,
}: AssignSubjectDialogProps) {
  const isEditing = editingProgramSubject !== null;

  const { data: program } = useProgram(programId);
  const { data: subjects = [] } = useSubjects();
  const createProgramSubjectMutation = useCreateProgramSubject();
  const updateProgramSubjectMutation = useUpdateProgramSubject();

  const programYears = program?.programYears ?? [];
  const programSubjects = program?.programSubjects ?? [];

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [requiredHours, setRequiredHours] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError(null);
    setSelectedSubjectId(editingProgramSubject?.subjectId ?? null);
    setSelectedYearId(editingProgramSubject?.yearId ?? null);
    setRequiredHours(
      editingProgramSubject ? String(editingProgramSubject.requiredHours) : "",
    );
  }, [open, editingProgramSubject]);

  const subjectOptions = useMemo(() => {
    if (isEditing && editingProgramSubject) {
      return [
        {
          id: editingProgramSubject.subject.id,
          name: editingProgramSubject.subject.name,
        },
      ];
    }

    return [...subjects]
      .map((subject) => ({ id: subject.id, name: subject.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "sl"));
  }, [editingProgramSubject, isEditing, subjects]);

  const selectableProgramYears = useMemo(() => {
    if (isEditing) {
      return programYears;
    }

    if (!selectedSubjectId) {
      return programYears;
    }

    const assignedYearIds = getAssignedYearIdsForSubject(
      programSubjects,
      selectedSubjectId,
    );

    return programYears.filter(
      (programYear) => !assignedYearIds.has(programYear.yearId),
    );
  }, [isEditing, programSubjects, programYears, selectedSubjectId]);

  const programYearsOptions =
    isEditing && editingProgramSubject
      ? [editingProgramSubject.programYear]
      : selectableProgramYears;

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (
      selectedYearId === null ||
      selectableProgramYears.some(
        (programYear) => programYear.yearId === selectedYearId,
      )
    ) {
      return;
    }

    setSelectedYearId(null);
  }, [isEditing, selectableProgramYears, selectedYearId]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValidationError(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const hoursAmount = Number(requiredHours);
    if (Number.isNaN(hoursAmount) || hoursAmount < 0) {
      setValidationError("Vnesite veljavno število ur na teden.");
      return;
    }

    if (!programId || !selectedSubjectId || !selectedYearId || !requiredHours) {
      setValidationError("Izpolnite vsa vnosna polja.");
      return;
    }

    setValidationError(null);

    try {
      if (isEditing && editingProgramSubject) {
        await updateProgramSubjectMutation.mutateAsync({
          programId,
          subjectId: selectedSubjectId,
          yearId: editingProgramSubject.yearId,
          requiredHours: hoursAmount,
        });
        toast.success("Predmet je bil uspešno posodobljen.");
      } else {
        await createProgramSubjectMutation.mutateAsync({
          programId,
          subjectId: selectedSubjectId,
          yearId: selectedYearId,
          requiredHours: hoursAmount,
        });
        toast.success("Predmet je bil uspešno dodan na predmetnik.");
      }

      handleOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? "Predmeta ni bilo mogoče posodobiti. Poskusite znova."
          : "Predmeta ni bilo mogoče dodati programu. Poskusite znova.",
      );
    }
  }

  const isSubmitting =
    createProgramSubjectMutation.isPending ||
    updateProgramSubjectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Urejanje predmeta" : "Dodajanje predmeta"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Posodobite število ur na teden za izbrani predmet."
              : "Izberite predmet, ki ga želite dodati temu programu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Predmet</Label>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={
                isSubmitting || isEditing || subjectOptions.length === 0
              }
              modal={false}
              items={subjectOptions.map((subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
            >
              <SelectTrigger id="subject" className="w-full">
                <SelectValue placeholder="Izberite predmet …" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((subject) => (
                  <SelectItem
                    key={`subject-${subject.id}`}
                    value={subject.id}
                  >
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Letnik</Label>
            <Select
              value={selectedYearId}
              onValueChange={setSelectedYearId}
              disabled={
                isSubmitting ||
                isEditing ||
                !selectedSubjectId ||
                selectableProgramYears.length === 0
              }
              modal={false}
              items={programYearsOptions.map((programYear) => ({
                value: programYear.yearId,
                label: programYear.year.name,
              }))}
            >
              <SelectTrigger id="year" className="w-full">
                <SelectValue placeholder="Izberite letnik …" />
              </SelectTrigger>
              <SelectContent>
                {programYearsOptions.map((programYear) => (
                  <SelectItem
                    key={`year-${programYear.yearId}`}
                    value={programYear.yearId}
                  >
                    {programYear.year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours-per-week">Število ur na teden</Label>
            <Input
              id="hours-per-week"
              type="number"
              min={0}
              max={40}
              step="0.0001"
              inputMode="decimal"
              placeholder="npr. 2"
              value={requiredHours}
              onChange={(event) => setRequiredHours(event.target.value)}
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
                  : "Dodaj predmet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
