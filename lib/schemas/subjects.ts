import { z } from "zod";

export const subjectFormSchema = z.object({
  name: z.string().trim().min(1, "Vnesite ime predmeta."),
  abbrevation: z.string().trim().min(1, "Vnesite kratico predmeta."),
  categoryId: z.string().min(1, "Izberite kategorijo."),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
