import { api } from "./axios";

export async function exportTeacherPdf(id: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/schools/export/teachers/${id}`, {
    responseType: "blob",
  });

  return data;
}
