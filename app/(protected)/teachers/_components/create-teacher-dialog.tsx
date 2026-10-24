"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

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
import { useCreateTeacher } from "@/lib/queries/teachers/mutations";
import {
  type CreateTeacherFormValues,
  createTeacherSchema,
} from "@/lib/schemas/teachers";

type CreateTeacherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTeacherDialog({
  open,
  onOpenChange,
}: CreateTeacherDialogProps) {
  const router = useRouter();
  const createTeacherMutation = useCreateTeacher();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({
        name: "",
        surname: "",
        email: "",
      });
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: CreateTeacherFormValues) {
    setError(null);

    try {
      const teacher = await createTeacherMutation.mutateAsync({
        name: values.name,
        surname: values.surname,
        email: values.email || null,
        assignedHours: 0,
      });
      handleOpenChange(false);
      router.push(`/teachers/${teacher.id}`);
    } catch {
      setError("Učitelja ni bilo mogoče ustvariti. Poskusite znova.");
    }
  }

  const isSubmitting = createTeacherMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj učitelja</DialogTitle>
          <DialogDescription>
            Vnesite ime in priimek. E-pošta je neobvezna. Po ustvaritvi boste
            lahko uredili preostale podatke.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-teacher-name">Ime</FieldLabel>
                  <Input
                    {...field}
                    id="create-teacher-name"
                    placeholder="npr. Ana"
                    autoFocus
                    autoComplete="given-name"
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
              name="surname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-teacher-surname">
                    Priimek
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-teacher-surname"
                    placeholder="npr. Novak"
                    autoComplete="family-name"
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-teacher-email">
                    E-pošta{" "}
                    <span className="font-normal text-muted-foreground">
                      (neobvezno)
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-teacher-email"
                    type="email"
                    placeholder="npr. ana.novak@sola.si"
                    autoComplete="email"
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

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
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
            <Button type="submit" disabled={isSubmitting}>
              <Plus />
              {isSubmitting ? "Ustvarjanje..." : "Ustvari učitelja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
