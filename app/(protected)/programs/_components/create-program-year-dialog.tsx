"use client";

import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProgramYear } from "@/lib/queries/program-years/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useYears } from "@/lib/queries/years/queries";
import {
  type CreateProgramYearFormValues,
  createProgramYearFormSchema,
} from "@/lib/schemas/programs";

type CreateProgramYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
};

export function CreateProgramYearDialog({
  open,
  onOpenChange,
  programId,
}: CreateProgramYearDialogProps) {
  const { data: program } = useProgram(programId);
  const { data: years = [] } = useYears({ enabled: open });
  const createProgramYearMutation = useCreateProgramYear();

  const programYears = program?.programYears ?? [];

  const form = useForm<CreateProgramYearFormValues>({
    resolver: zodResolver(createProgramYearFormSchema),
    defaultValues: {
      yearId: "",
      numWeeks: "",
    },
  });

  const selectableYears = useMemo(() => {
    const assignedYearIds = new Set(programYears.map((item) => item.yearId));
    return years.filter((year) => !assignedYearIds.has(year.id));
  }, [programYears, years]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      yearId: "",
      numWeeks: "",
    });
  }, [open, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset({ yearId: "", numWeeks: "" });
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: CreateProgramYearFormValues) {
    try {
      await createProgramYearMutation.mutateAsync({
        programId,
        yearId: Number(values.yearId),
        numWeeks: Number(values.numWeeks),
      });
      toast.success("Letnik je bil uspešno dodan.");
      handleOpenChange(false);
    } catch {
      toast.error("Letnika ni bilo mogoče dodati. Poskusite znova.");
    }
  }

  const isSubmitting = createProgramYearMutation.isPending;

  const yearItems = selectableYears.map((year) => ({
    value: String(year.id),
    label: year.name,
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodajanje letnika</DialogTitle>
          <DialogDescription>
            Izberite letnik in nastavite število tednov v šolskem letu.
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
                  <FieldLabel htmlFor="create-program-year">Letnik</FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) =>
                      field.onChange(value == null ? "" : String(value))
                    }
                    disabled={isSubmitting || selectableYears.length === 0}
                    modal={false}
                    items={yearItems}
                  >
                    <SelectTrigger
                      id="create-program-year"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Izberite letnik …" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableYears.map((year) => (
                        <SelectItem key={year.id} value={String(year.id)}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                  {selectableYears.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Vsi letniki so že dodani v ta program.
                    </p>
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="numWeeks"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-program-year-weeks">
                    Število tednov
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-program-year-weeks"
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
            <Button
              type="submit"
              disabled={isSubmitting || selectableYears.length === 0}
            >
              <Plus />
              {isSubmitting ? "Shranjevanje..." : "Dodaj letnik"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
