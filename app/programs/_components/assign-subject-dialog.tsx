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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createProgramSubject,
  getSubjects,
  updateProgramSubject,
} from "@/lib/api";
import type { ProgramSubjectItem, ProgramYear, Subject } from "@/types";

type AssignSubjectDialogProps = {
  open: boolean;
  programId: number;
  programYears: ProgramYear[];
  programSubjects: ProgramSubjectItem[];
  editingProgramSubject: ProgramSubjectItem | null;
  onOpenChange: (open: boolean) => void;
  onSubjectSaved?: () => void | Promise<void>;
};

function AssignSubjectSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

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
  programYears,
  programSubjects,
  editingProgramSubject,
  onOpenChange,
  onSubjectSaved,
}: AssignSubjectDialogProps) {
  const isEditing = editingProgramSubject !== null;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [requiredHours, setRequiredHours] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setValidationError(null);
      setIsSubmitting(false);
      setSelectedSubjectId(editingProgramSubject?.subjectId ?? null);
      setSelectedYearId(editingProgramSubject?.yearId ?? null);
      setRequiredHours(
        editingProgramSubject
          ? String(editingProgramSubject.requiredHours)
          : "",
      );

      try {
        const subjectsData = await getSubjects();

        if (!cancelled) {
          setSubjects(subjectsData);
        }
      } catch {
        if (!cancelled) {
          toast.error("Predmetov ni bilo mogoče pridobiti.");
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
  }, [open, editingProgramSubject]);

  const subjectOptions =
    isEditing && editingProgramSubject
      ? [editingProgramSubject.subject]
      : subjects;

  const selectableProgramYears = useMemo(() => {
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
  }, [programSubjects, programYears, selectedSubjectId]);

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
      setIsSubmitting(false);
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
    setIsSubmitting(true);

    try {
      if (isEditing && editingProgramSubject) {
        await updateProgramSubject({
          programId,
          subjectId: selectedSubjectId,
          yearId: editingProgramSubject.yearId,
          requiredHours: hoursAmount,
        });
        toast.success("Predmet je bil uspešno posodobljen.");
      } else {
        await createProgramSubject({
          programId,
          subjectId: selectedSubjectId,
          yearId: selectedYearId,
          requiredHours: hoursAmount,
        });
        toast.success("Predmet je bil uspešno dodan na predmetnik.");
      }

      handleOpenChange(false);
      await onSubjectSaved?.();
    } catch {
      toast.error(
        isEditing
          ? "Predmeta ni bilo mogoče posodobiti. Poskusite znova."
          : "Predmeta ni bilo mogoče dodati programu. Poskusite znova.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <>
            <DialogHeader className="shrink-0 border-b px-4 pt-4 pb-3">
              <DialogTitle>Nalaganje predmetov</DialogTitle>
              <DialogDescription>Prosimo počakajte …</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <AssignSubjectSkeleton />
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
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
                      <SelectItem key={subject.id} value={subject.id}>
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
                  items={(isEditing && editingProgramSubject
                    ? [editingProgramSubject.programYear]
                    : selectableProgramYears
                  ).map((programYear) => ({
                    value: programYear.yearId,
                    label: programYear.year.name,
                  }))}
                >
                  <SelectTrigger id="year" className="w-full">
                    <SelectValue placeholder="Izberite letnik …" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isEditing && editingProgramSubject
                      ? [editingProgramSubject.programYear]
                      : selectableProgramYears
                    ).map((programYear) => (
                      <SelectItem
                        key={programYear.yearId}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
