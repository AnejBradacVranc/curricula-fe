import type {
  ApiResponse,
  ExtractedTeacher,
  ResolvedExtractProgram,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const extractTeachers = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return unwrap(
    api.post<ApiResponse<ExtractedTeacher[]>>(
      "/schools/extract/teachers",
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    ),
  );
};

export const extractProgram = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return unwrap(
    api.post<ApiResponse<ResolvedExtractProgram>>(
      "/schools/extract/program",
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    ),
  );
};
