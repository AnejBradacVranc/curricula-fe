"use client";

import { useEffect } from "react";
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
import { useCategories } from "@/lib/queries/categories/queries";
import {
  useCreateSubject,
  useUpdateSubject,
} from "@/lib/queries/subjects/mutations";
import {
  type SubjectFormValues,
  subjectFormSchema,
} from "@/lib/schemas/subjects";
import type { Subject } from "@/types";

type SubjectDialogProps = {
  open: boolean;
  editingSubject: Subject | null;
  onOpenChange: (open: boolean) => void;
};

export function SubjectDialog({
  open,
  editingSubject,
  onOpenChange,
}: SubjectDialogProps) {
  const isEditing = editingSubject !== null;

  const { data: categories = [] } = useCategories({ enabled: open });
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      abbrevation: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      name: editingSubject?.name ?? "",
      abbrevation: editingSubject?.abbrevation ?? "",
      categoryId:
        editingSubject?.categoryId != null
          ? String(editingSubject.categoryId)
          : "",
    });
  }, [open, editingSubject, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({
        name: "",
        abbrevation: "",
        categoryId: "",
      });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: SubjectFormValues) {
    try {
      if (isEditing && editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          name: values.name,
          abbrevation: values.abbrevation,
          categoryId: Number(values.categoryId),
        });
        toast.success("Predmet je bil uspešno posodobljen.");
      } else {
        await createSubjectMutation.mutateAsync({
          name: values.name,
          abbrevation: values.abbrevation,
          categoryId: Number(values.categoryId),
        });
        toast.success("Predmet je bil uspešno ustvarjen.");
      }

      handleOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? "Predmeta ni bilo mogoče posodobiti. Poskusite znova."
          : "Predmeta ni bilo mogoče ustvariti. Poskusite znova.",
      );
    }
  }

  const isSubmitting =
    createSubjectMutation.isPending || updateSubjectMutation.isPending;

  const categoryItems = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Urejanje predmeta" : "Nov predmet"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Posodobite ime, kratico ali kategorijo predmeta."
              : "Izberite kategorijo in vnesite ime ter kratico predmeta."}
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
                  <FieldLabel htmlFor="subject-category">Kategorija</FieldLabel>
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
                      id="subject-category"
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
                  <FieldLabel htmlFor="subject-name">Ime predmeta</FieldLabel>
                  <Input
                    {...field}
                    id="subject-name"
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
                  <FieldLabel htmlFor="subject-abbrevation">Kratica</FieldLabel>
                  <Input
                    {...field}
                    id="subject-abbrevation"
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
                  : "Ustvari predmet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
