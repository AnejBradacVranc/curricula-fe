import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Vnesite ime programa."),
});

export type CreateProgramValues = z.infer<typeof createProgramSchema>;

const numWeeksSchema = z
  .string()
  .trim()
  .min(1, "Vnesite veljavno število tednov (vsaj 1).")
  .refine((value) => {
    const weeks = Number(value);
    return Number.isInteger(weeks) && weeks >= 1;
  }, "Vnesite veljavno število tednov (vsaj 1).");

export const createProgramYearFormSchema = z.object({
  yearId: z.string().min(1, "Izberite letnik."),
  numWeeks: numWeeksSchema,
});

export const updateProgramYearFormSchema = z.object({
  numWeeks: numWeeksSchema,
});

export type CreateProgramYearFormValues = z.infer<
  typeof createProgramYearFormSchema
>;
export type UpdateProgramYearFormValues = z.infer<
  typeof updateProgramYearFormSchema
>;

export const createClassFormSchema = z.object({
  label: z.string().trim().min(1, "Vnesite oznako razreda."),
});

export type CreateClassFormValues = z.infer<typeof createClassFormSchema>;

const requiredHoursSchema = z
  .string()
  .trim()
  .min(1, "Vnesite veljavno število ur na teden.")
  .refine((value) => {
    const hours = Number(value);
    return !Number.isNaN(hours) && hours >= 0;
  }, "Vnesite veljavno število ur na teden.");

export const createProgramSubjectFormSchema = z.object({
  subjectId: z.string().min(1, "Izberite predmet."),
  yearId: z.string().min(1, "Izberite letnik."),
  requiredHours: requiredHoursSchema,
});

export type CreateProgramSubjectFormValues = z.infer<
  typeof createProgramSubjectFormSchema
>;

export const updateProgramSubjectFormSchema = z.object({
  name: z.string().trim().min(1, "Vnesite ime predmeta."),
  abbrevation: z.string().trim().min(1, "Vnesite kratico predmeta."),
  categoryId: z.string().min(1, "Izberite kategorijo."),
  requiredHours: requiredHoursSchema,
});

export type UpdateProgramSubjectFormValues = z.infer<
  typeof updateProgramSubjectFormSchema
>;
