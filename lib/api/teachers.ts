import type {
  ApiResponse,
  CreateTeacherRequest,
  CreateTeachersRequest,
  Teacher,
  TeacherDetail,
  UpdateTeacherRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getTeachers = () =>
  unwrap(api.get<ApiResponse<Teacher[]>>("/schools/teachers"));

export const getTeacher = (id: number) =>
  unwrap(api.get<ApiResponse<TeacherDetail | null>>(`/schools/teachers/${id}`));

export const createTeacher = (data: CreateTeacherRequest) =>
  unwrap(api.post<ApiResponse<Teacher>>("/schools/teachers", data));

export const createTeachers = (data: CreateTeachersRequest) =>
  unwrap(api.post<ApiResponse<Teacher[]>>("/schools/teachers/bulk", data));

export const updateTeacher = (
  id: number,
  data: UpdateTeacherRequest,
  profileImage?: File | null,
) => {
  if (profileImage instanceof File) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("surname", data.surname);
    formData.append("email", data.email);
    if (data.color !== undefined) {
      formData.append("color", data.color ?? "");
    }
    formData.append("file", profileImage);

    return unwrap(
      api.patch<ApiResponse<TeacherDetail>>(
        `/schools/teachers/${id}`,
        formData,
        {
          headers: { "Content-Type": undefined },
        },
      ),
    );
  }

  return unwrap(
    api.patch<ApiResponse<TeacherDetail>>(`/schools/teachers/${id}`, {
      ...data,
      ...(profileImage === null ? { removeProfileImage: true } : {}),
    }),
  );
};

export const deleteTeacher = (id: number) =>
  unwrap(api.delete<ApiResponse<Teacher>>(`/schools/teachers/${id}`));
