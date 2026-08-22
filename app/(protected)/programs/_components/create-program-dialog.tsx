"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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
import { useCreateProgram } from "@/lib/queries/programs/mutations";
import { Controller, useForm } from "react-hook-form";
import { createProgramSchema, CreateProgramValues } from "@/lib/schemas/programs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type CreateProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProgramDialog({
  open,
  onOpenChange,
}: CreateProgramDialogProps) {
  const router = useRouter();
  const createProgramMutation = useCreateProgram();
  const [error, setError] = useState<string | null>(null);

  const createProgramForm = useForm<CreateProgramValues>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: { name: "" },
  });

  function resetForm() {
    createProgramForm.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: CreateProgramValues) {

    try {
      const program = await createProgramMutation.mutateAsync(values);
      handleOpenChange(false);
      router.push(`/programs/${program.id}`);
    } catch {
      setError("Programa ni bilo mogoče ustvariti. Poskusite znova.");
    }
  }

  const isSubmitting = createProgramMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj program</DialogTitle>
          <DialogDescription>
            Vnesite ime programa. Po ustvaritvi boste lahko dodali letnike,
            razrede in predmete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={createProgramForm.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={createProgramForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <FieldLabel htmlFor="program-name">Ime programa</FieldLabel>
                <Input
                  {...field}
                  id="program-name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
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
              <Plus />
              {isSubmitting ? "Ustvarjanje..." : "Ustvari program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
