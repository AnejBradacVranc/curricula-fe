import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Vnesite veljaven e-poštni naslov.")
    .min(1, "Vnesite e-pošto."),
  password: z.string().min(1, "Vnesite geslo."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  surname: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  email: z
    .email("Vnesite veljaven e-poštni naslov.")
    .min(1, "Vnesite e-pošto."),
  password: z.string().min(1, "Vnesite geslo."),
  schoolId: z
    .string()
    .trim()
    .min(1, "Vnesite ID šole.")
    .regex(/^\d+$/, "ID šole mora biti celo število.")
    .refine((value) => Number(value) >= 1, {
      message: "ID šole mora biti vsaj 1.",
    }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
