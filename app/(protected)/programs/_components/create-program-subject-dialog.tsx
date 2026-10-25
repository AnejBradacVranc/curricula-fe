"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { formatYearLabel } from "@/lib/curriculum/format-year";
import { useCreateProgramSubject } from "@/lib/queries/program-subjects/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useSubjects } from "@/lib/queries/subjects/queries";
import {
  type CreateProgramSubjectFormValues,
  createProgramSubjectFormSchema,
} from "@/lib/schemas/programs";
import type { ProgramSubjectItem } from "@/types";

type CreateProgramSubjectDialogProps = {
  open: boolean;
  programId: number;
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

export function CreateProgramSubjectDialog({
  open,
  programId,
  onOpenChange,
}: CreateProgramSubjectDialogProps) {
  const { data: program } = useProgram(programId);
  const { data: subjects = [] } = useSubjects();
  const createProgramSubjectMutation = useCreateProgramSubject();

  const programYears = program?.programYears ?? [];
  const programSubjects = program?.programSubjects ?? [];

  const form = useForm<CreateProgramSubjectFormValues>({
    resolver: zodResolver(createProgramSubjectFormSchema),
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

  const selectedYearId = useWatch({
    control: form.control,
    name: "yearId",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      subjectId: "",
      yearId: "",
      requiredHours: "",
    });
  }, [open, form]);

  const subjectOptions = useMemo(
    () =>
      [...subjects]
        .map((subject) => ({ id: subject.id, name: subject.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "sl")),
    [subjects],
  );

  const selectableProgramYears = useMemo(() => {
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
  }, [programSubjects, programYears, selectedSubjectId]);

  useEffect(() => {
    if (
      !selectedYearId ||
      selectableProgramYears.some(
        (programYear) => String(programYear.yearId) === selectedYearId,
      )
    ) {
      return;
    }

    form.setValue("yearId", "");
  }, [selectableProgramYears, selectedYearId, form]);

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

  async function handleSubmit(values: CreateProgramSubjectFormValues) {
    try {
      await createProgramSubjectMutation.mutateAsync({
        programId,
        subjectId: Number(values.subjectId),
        yearId: Number(values.yearId),
        requiredHours: Number(values.requiredHours),
      });
      toast.success("Predmet je bil uspešno dodan na predmetnik.");
      handleOpenChange(false);
    } catch {
      toast.error("Predmeta ni bilo mogoče dodati programu. Poskusite znova.");
    }
  }

  const isSubmitting = createProgramSubjectMutation.isPending;

  const subjectItems = subjectOptions.map((subject) => ({
    value: String(subject.id),
    label: subject.name,
  }));

  const yearItems = selectableProgramYears.map((programYear) => ({
    value: String(programYear.yearId),
    label: formatYearLabel(programYear.year.year),
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodajanje predmeta</DialogTitle>
          <DialogDescription>
            Izberite predmet, ki ga želite dodati temu programu.
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
                  <FieldLabel htmlFor="create-program-subject">
                    Predmet
                  </FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={isSubmitting || subjectOptions.length === 0}
                    modal={false}
                    items={subjectItems}
                  >
                    <SelectTrigger
                      id="create-program-subject"
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
                  <FieldLabel htmlFor="create-program-subject-year">
                    Letnik
                  </FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={
                      isSubmitting ||
                      !selectedSubjectId ||
                      selectableProgramYears.length === 0
                    }
                    modal={false}
                    items={yearItems}
                  >
                    <SelectTrigger
                      id="create-program-subject-year"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite letnik …" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableProgramYears.map((programYear) => (
                        <SelectItem
                          key={`year-${programYear.yearId}`}
                          value={String(programYear.yearId)}
                        >
                          {formatYearLabel(programYear.year.year)}
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
                  <FieldLabel htmlFor="create-program-subject-hours">
                    Število ur na teden
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-program-subject-hours"
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
              <Plus />
              {isSubmitting ? "Shranjevanje..." : "Dodaj predmet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
