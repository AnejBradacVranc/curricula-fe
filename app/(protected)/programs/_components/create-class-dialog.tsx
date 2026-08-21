"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { useCreateClass } from "@/lib/queries/classes/mutations";
import {
  type CreateClassFormValues,
  createClassFormSchema,
} from "@/lib/schemas/programs";
import type { ProgramYear } from "@/types";

type CreateClassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programYear: ProgramYear | null;
};

export function CreateClassDialog({
  open,
  onOpenChange,
  programId,
  programYear,
}: CreateClassDialogProps) {
  const createClassMutation = useCreateClass();

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassFormSchema),
    defaultValues: { label: "" },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ label: "" });
    }
  }, [open, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ label: "" });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: CreateClassFormValues) {
    if (!programYear) {
      return;
    }

    const trimmedLabel = values.label.trim().toLowerCase();

    if (
      programYear.classes.some(
        (item) => item.label.toLowerCase() === trimmedLabel,
      )
    ) {
      form.setError("label", {
        message: "Razred s to oznako že obstaja.",
      });
      return;
    }

    try {
      const created = await createClassMutation.mutateAsync({
        programId,
        yearId: programYear.yearId,
        label: trimmedLabel,
      });
      toast.success("Razred je bil uspešno dodan.", {
        description: `${programYear.year.name.slice(0, 1)}. ${created.label.toUpperCase()}`,
      });
      handleOpenChange(false);
    } catch {
      form.setError("root", {
        message: "Razreda ni bilo mogoče dodati. Poskusite znova.",
      });
    }
  }

  const isSubmitting = createClassMutation.isPending;
  const labelValue = form.watch("label");

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

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="label"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="class-label">Oznaka</FieldLabel>
                  <Input
                    {...field}
                    id="class-label"
                    placeholder="npr. a"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>

          {form.formState.errors.root ? (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Prekliči
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !labelValue.trim()}
            >
              <Plus />
              {isSubmitting ? "Dodajanje..." : "Dodaj razred"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
