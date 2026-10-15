"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
  useCreateProgramYear,
  useUpdateProgramYear,
} from "@/lib/queries/program-years/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useYears } from "@/lib/queries/years/queries";
import {
  type ProgramYearFormValues,
  programYearFormSchema,
} from "@/lib/schemas/programs";
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

  const form = useForm<ProgramYearFormValues>({
    resolver: zodResolver(programYearFormSchema),
    defaultValues: {
      yearId: "",
      numWeeks: "",
    },
  });

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

    form.reset({
      yearId:
        editingProgramYear?.yearId != null
          ? String(editingProgramYear.yearId)
          : "",
      numWeeks: editingProgramYear
        ? String(editingProgramYear.numWeeks)
        : "",
    });
  }, [open, editingProgramYear, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ yearId: "", numWeeks: "" });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: ProgramYearFormValues) {
    const yearId = Number(values.yearId);
    const numWeeks = Number(values.numWeeks);

    try {
      if (isEditing) {
        await updateProgramYearMutation.mutateAsync({
          programId,
          yearId,
          numWeeks,
        });
        toast.success("Letnik je bil uspešno posodobljen.");
      } else {
        await createProgramYearMutation.mutateAsync({
          programId,
          yearId,
          numWeeks,
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

  const yearOptions =
    isEditing && editingProgramYear
      ? [editingProgramYear.year]
      : selectableYears;

  const yearItems = yearOptions.map((year) => ({
    value: String(year.id),
    label: year.name,
  }));

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

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="yearId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program-year">Letnik</FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={
                      isSubmitting || isEditing || selectableYears.length === 0
                    }
                    modal={false}
                    items={yearItems}
                  >
                    <SelectTrigger
                      id="program-year"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite letnik …" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year.id} value={String(year.id)}>
                          {year.name}
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
              name="numWeeks"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="num-weeks">Število tednov</FieldLabel>
                  <Input
                    {...field}
                    id="num-weeks"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="npr. 35"
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
                  : "Dodaj letnik"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
