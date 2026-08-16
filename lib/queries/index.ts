export { teacherKeys } from "./teachers/keys";
export { useTeacher, useTeachers } from "./teachers/queries";
export {
  useCreateTeacher,
  useCreateTeachers,
  useDeleteTeacher,
  useUpdateTeacher,
} from "./teachers/mutations";

export { programKeys } from "./programs/keys";
export { useProgram, usePrograms } from "./programs/queries";
export {
  useCreateProgram,
  useDeleteProgram,
  useImportProgram,
} from "./programs/mutations";

export { subjectKeys } from "./subjects/keys";
export { useSubjects } from "./subjects/queries";
export { useCreateSubject, useUpdateSubject } from "./subjects/mutations";

export { categoryKeys } from "./categories/keys";
export { useCategories } from "./categories/queries";

export { yearKeys } from "./years/keys";
export { useYears } from "./years/queries";

export {
  useCreateProgramYear,
  useUpdateProgramYear,
} from "./program-years/mutations";

export { programSubjectKeys } from "./program-subjects/keys";
export { useProgramSubjects } from "./program-subjects/queries";
export {
  useCreateProgramSubject,
  useDeleteProgramSubject,
  useUpdateProgramSubject,
} from "./program-subjects/mutations";

export { classKeys } from "./classes/keys";
export { useClasses } from "./classes/queries";
export { useCreateClass, useDeleteClass } from "./classes/mutations";

export { useAssignTeacher, useUnassignTeacher } from "./assignments/mutations";

export { additionalActivityKeys } from "./additional-activities/keys";
export { useAdditionalActivities } from "./additional-activities/queries";
export {
  useCreateAdditionalActivityAssignment,
  useDeleteAdditionalActivityAssignment,
} from "./additional-activities/mutations";

export { schoolKeys } from "./schools/keys";
export { useMySchool, useSchools } from "./schools/queries";
export { useCreateSchool } from "./schools/mutations";

export { userKeys } from "./users/keys";
export { useUserByEmail, useUsers } from "./users/queries";

export { useLogin, useLogout, useRegister } from "./auth/mutations";

export { useExtractProgram, useExtractTeachers } from "./extract/mutations";

export { useExportTeacherPdf } from "./export/mutations";

export { appKeys } from "./app/keys";
export { useAppInfo } from "./app/queries";
