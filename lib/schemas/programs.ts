import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Vnesite ime programa."),
});

export type CreateProgramValues = z.infer<typeof createProgramSchema>;
