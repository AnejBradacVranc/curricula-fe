"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { formatYearLabel } from "@/lib/curriculum/format-year";
import { useCategories } from "@/lib/queries/categories/queries";
import { useUpdateProgramSubject } from "@/lib/queries/program-subjects/mutations";
import { useUpdateSubject } from "@/lib/queries/subjects/mutations";
import {
  type UpdateProgramSubjectFormValues,
  updateProgramSubjectFormSchema,
} from "@/lib/schemas/programs";
import type { ProgramSubjectItem } from "@/types";

type UpdateProgramSubjectDialogProps = {
  open: boolean;
  programId: number;
  programSubject: ProgramSubjectItem | null;
  onOpenChange: (open: boolean) => void;
};

export function UpdateProgramSubjectDialog({
  open,
  programId,
  programSubject,
  onOpenChange,
}: UpdateProgramSubjectDialogProps) {
  const { data: categories = [] } = useCategories({ enabled: open });
  const updateSubjectMutation = useUpdateSubject();
  const updateProgramSubjectMutation = useUpdateProgramSubject();

  const form = useForm<UpdateProgramSubjectFormValues>({
    resolver: zodResolver(updateProgramSubjectFormSchema),
    defaultValues: {
      name: "",
      abbrevation: "",
      categoryId: "",
      requiredHours: "",
    },
  });

  useEffect(() => {
    if (!open || !programSubject) {
      return;
    }

    form.reset({
      name: programSubject.subject.name,
      abbrevation: programSubject.subject.abbrevation,
      categoryId:
        programSubject.subject.categoryId != null
          ? String(programSubject.subject.categoryId)
          : "",
      requiredHours: String(programSubject.requiredHours),
    });
  }, [open, programSubject, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({
        name: "",
        abbrevation: "",
        categoryId: "",
        requiredHours: "",
      });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: UpdateProgramSubjectFormValues) {
    if (!programSubject) {
      return;
    }

    try {
      await Promise.all([
        updateSubjectMutation.mutateAsync({
          id: programSubject.subjectId,
          name: values.name,
          abbrevation: values.abbrevation,
          categoryId: Number(values.categoryId),
        }),
        updateProgramSubjectMutation.mutateAsync({
          programId,
          subjectId: programSubject.subjectId,
          yearId: programSubject.yearId,
          requiredHours: Number(values.requiredHours),
        }),
      ]);
      toast.success("Predmet je bil uspešno posodobljen.");
      handleOpenChange(false);
    } catch {
      toast.error("Predmeta ni bilo mogoče posodobiti. Poskusite znova.");
    }
  }

  const isSubmitting =
    updateSubjectMutation.isPending || updateProgramSubjectMutation.isPending;

  const categoryItems = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const yearLabel = programSubject
    ? formatYearLabel(programSubject.programYear.year.year)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Urejanje predmeta</DialogTitle>
          <DialogDescription>
            {yearLabel
              ? `Posodobite podatke predmeta in ure na teden (${yearLabel}).`
              : "Posodobite podatke predmeta in ure na teden."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-program-subject-category">
                    Kategorija
                  </FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={isSubmitting || categories.length === 0}
                    modal={false}
                    items={categoryItems}
                  >
                    <SelectTrigger
                      id="update-program-subject-category"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite kategorijo …" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={`category-${category.id}`}
                          value={String(category.id)}
                        >
                          {category.name}
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
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-program-subject-name">
                    Ime predmeta
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-program-subject-name"
                    placeholder="npr. Matematika"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="abbrevation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-program-subject-abbrevation">
                    Kratica
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-program-subject-abbrevation"
                    placeholder="npr. MAT"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
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
                  <FieldLabel htmlFor="update-program-subject-hours">
                    Število ur na teden
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-program-subject-hours"
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
            <Button type="submit" disabled={isSubmitting || !programSubject}>
              <Pencil />
              {isSubmitting ? "Shranjevanje..." : "Shrani spremembe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
