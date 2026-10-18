import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Vnesite veljaven e-poštni naslov.")
    .min(1, "Vnesite e-pošto."),
  password: z.string().min(1, "Vnesite geslo."),
});

export const registerSchema = z
  .object({
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
    repeat_password: z.string().min(1, "Ponovno vnesite geslo."),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "Gesli se ne ujemata.",
    path: ["repeat_password"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
