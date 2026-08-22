import { api } from "./axios";

export async function exportTeacherPdf(id: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/schools/export/teachers/${id}`, {
    responseType: "blob",
  });

  return data;
}

export async function exportTeachersPdf(ids?: number[]): Promise<Blob> {
  const { data } = await api.post<Blob>(
    "/schools/export/teachers",
    { ids: ids?.length ? ids : undefined },
    { responseType: "blob" },
  );

  return data;
}
