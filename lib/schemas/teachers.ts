import { z } from "zod";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Vnesite veljaven e-poštni naslov.",
  );

export const createTeacherSchema = z.object({
  name: z.string().trim().min(1, "Vnesite ime."),
  surname: z.string().trim().min(1, "Vnesite priimek."),
  email: optionalEmailSchema,
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  name: z.string().trim().min(1, "Vnesite ime."),
  surname: z.string().trim().min(1, "Vnesite priimek."),
  email: optionalEmailSchema,
  color: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || HEX_COLOR_PATTERN.test(value),
      "Barva mora biti v obliki #RGB ali #RRGGBB.",
    ),
});

export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;
