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
import { useUpdateProgramYear } from "@/lib/queries/program-years/mutations";
import {
  type UpdateProgramYearFormValues,
  updateProgramYearFormSchema,
} from "@/lib/schemas/programs";
import type { ProgramYear } from "@/types";

type UpdateProgramYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programYear: ProgramYear | null;
};

export function UpdateProgramYearDialog({
  open,
  onOpenChange,
  programId,
  programYear,
}: UpdateProgramYearDialogProps) {
  const updateProgramYearMutation = useUpdateProgramYear();

  const form = useForm<UpdateProgramYearFormValues>({
    resolver: zodResolver(updateProgramYearFormSchema),
    defaultValues: {
      numWeeks: "",
    },
  });

  useEffect(() => {
    if (!open || !programYear) {
      return;
    }

    form.reset({
      numWeeks: String(programYear.numWeeks),
    });
  }, [open, programYear, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ numWeeks: "" });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: UpdateProgramYearFormValues) {
    if (!programYear) {
      return;
    }

    try {
      await updateProgramYearMutation.mutateAsync({
        programId,
        yearId: programYear.yearId,
        numWeeks: Number(values.numWeeks),
      });
      toast.success("Letnik je bil uspešno posodobljen.");
      handleOpenChange(false);
    } catch {
      toast.error("Letnika ni bilo mogoče posodobiti. Poskusite znova.");
    }
  }

  const isSubmitting = updateProgramYearMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Urejanje letnika</DialogTitle>
          <DialogDescription>
            Posodobite število tednov za izbrani letnik.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <p className="text-sm font-medium">{programYear?.year.name}</p>

            <Controller
              name="numWeeks"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-program-year-weeks">
                    Število tednov
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-program-year-weeks"
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
            <Button type="submit" disabled={isSubmitting || !programYear}>
              <Pencil />
              {isSubmitting ? "Shranjevanje..." : "Shrani spremembe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
