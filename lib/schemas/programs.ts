import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Vnesite ime programa."),
});

export type CreateProgramValues = z.infer<typeof createProgramSchema>;

export const programYearFormSchema = z.object({
  yearId: z.string().min(1, "Izberite letnik."),
  numWeeks: z
    .string()
    .trim()
    .min(1, "Vnesite veljavno število tednov (vsaj 1).")
    .refine((value) => {
      const weeks = Number(value);
      return Number.isInteger(weeks) && weeks >= 1;
    }, "Vnesite veljavno število tednov (vsaj 1)."),
});

export type ProgramYearFormValues = z.infer<typeof programYearFormSchema>;

export const createClassFormSchema = z.object({
  label: z.string().trim().min(1, "Vnesite oznako razreda."),
});

export type CreateClassFormValues = z.infer<typeof createClassFormSchema>;

export const assignSubjectFormSchema = z.object({
  subjectId: z.string().min(1, "Izberite predmet."),
  yearId: z.string().min(1, "Izberite letnik."),
  requiredHours: z
    .string()
    .trim()
    .min(1, "Vnesite veljavno število ur na teden.")
    .refine((value) => {
      const hours = Number(value);
      return !Number.isNaN(hours) && hours >= 0;
    }, "Vnesite veljavno število ur na teden."),
});

export type AssignSubjectFormValues = z.infer<typeof assignSubjectFormSchema>;
