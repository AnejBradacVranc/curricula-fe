import { z } from "zod";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const updateTeacherSchema = z.object({
  name: z.string().trim().min(1, "Vnesite ime."),
  surname: z.string().trim().min(1, "Vnesite priimek."),
  email: z
    .email("Vnesite veljaven e-poštni naslov.")
    .min(1, "Vnesite e-pošto."),
  color: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || HEX_COLOR_PATTERN.test(value),
      "Barva mora biti v obliki #RGB ali #RRGGBB.",
    ),
});

export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;
