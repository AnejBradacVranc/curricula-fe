import { z } from "zod";

export const createAdditionalActivityAssignmentSchema = z.object({
  additionalActivityId: z.string().min(1, "Izberite dejavnost."),
  hoursAmount: z
    .string()
    .trim()
    .min(1, "Vnesite veljavno število ur.")
    .refine((value) => {
      const hours = Number(value);
      return !Number.isNaN(hours) && hours >= 0;
    }, "Vnesite veljavno število ur."),
});

export type CreateAdditionalActivityAssignmentFormValues = z.infer<
  typeof createAdditionalActivityAssignmentSchema
>;
