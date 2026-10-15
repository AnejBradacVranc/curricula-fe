"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import {
  type AssignSubjectFormValues,
  assignSubjectFormSchema,
} from "@/lib/schemas/programs";
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

  const form = useForm<AssignSubjectFormValues>({
    resolver: zodResolver(assignSubjectFormSchema),
    defaultValues: {
      subjectId: "",
      yearId: "",
      requiredHours: "",
    },
  });

  const selectedSubjectId = useWatch({
    control: form.control,
    name: "subjectId",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      subjectId:
        editingProgramSubject?.subjectId != null
          ? String(editingProgramSubject.subjectId)
          : "",
      yearId:
        editingProgramSubject?.yearId != null
          ? String(editingProgramSubject.yearId)
          : "",
      requiredHours: editingProgramSubject
        ? String(editingProgramSubject.requiredHours)
        : "",
    });
  }, [open, editingProgramSubject, form]);

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
      Number(selectedSubjectId),
    );

    return programYears.filter(
      (programYear) => !assignedYearIds.has(programYear.yearId),
    );
  }, [isEditing, programSubjects, programYears, selectedSubjectId]);

  const programYearsOptions =
    isEditing && editingProgramSubject
      ? [editingProgramSubject.programYear]
      : selectableProgramYears;

  const selectedYearId = useWatch({
    control: form.control,
    name: "yearId",
  });

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (
      !selectedYearId ||
      selectableProgramYears.some(
        (programYear) => String(programYear.yearId) === selectedYearId,
      )
    ) {
      return;
    }

    form.setValue("yearId", "");
  }, [isEditing, selectableProgramYears, selectedYearId, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({
        subjectId: "",
        yearId: "",
        requiredHours: "",
      });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: AssignSubjectFormValues) {
    const subjectId = Number(values.subjectId);
    const yearId = Number(values.yearId);
    const requiredHours = Number(values.requiredHours);

    try {
      if (isEditing && editingProgramSubject) {
        await updateProgramSubjectMutation.mutateAsync({
          programId,
          subjectId,
          yearId: editingProgramSubject.yearId,
          requiredHours,
        });
        toast.success("Predmet je bil uspešno posodobljen.");
      } else {
        await createProgramSubjectMutation.mutateAsync({
          programId,
          subjectId,
          yearId,
          requiredHours,
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

  const subjectItems = subjectOptions.map((subject) => ({
    value: String(subject.id),
    label: subject.name,
  }));

  const yearItems = programYearsOptions.map((programYear) => ({
    value: String(programYear.yearId),
    label: programYear.year.name,
  }));

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

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="subjectId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="subject">Predmet</FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={
                      isSubmitting || isEditing || subjectOptions.length === 0
                    }
                    modal={false}
                    items={subjectItems}
                  >
                    <SelectTrigger
                      id="subject"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite predmet …" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((subject) => (
                        <SelectItem
                          key={`subject-${subject.id}`}
                          value={String(subject.id)}
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="yearId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="year">Letnik</FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={
                      isSubmitting ||
                      isEditing ||
                      !selectedSubjectId ||
                      selectableProgramYears.length === 0
                    }
                    modal={false}
                    items={yearItems}
                  >
                    <SelectTrigger
                      id="year"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite letnik …" />
                    </SelectTrigger>
                    <SelectContent>
                      {programYearsOptions.map((programYear) => (
                        <SelectItem
                          key={`year-${programYear.yearId}`}
                          value={String(programYear.yearId)}
                        >
                          {programYear.year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="requiredHours"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="hours-per-week">
                    Število ur na teden
                  </FieldLabel>
                  <Input
                    {...field}
                    id="hours-per-week"
                    type="number"
                    min={0}
                    max={40}
                    step="0.0001"
                    inputMode="decimal"
                    placeholder="npr. 2"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>

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
