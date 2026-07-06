export type { ApiResponse } from "./api";
export { Role } from "./enums/role";

export type { Timestamps } from "./entities/common";
export type {
  ClassLabel,
  ClassSubjectAssignment,
  ProgramClass,
} from "./entities/class";
export type {
  School,
  SchoolProgram,
  SchoolSubject,
  SchoolTeacher,
  SchoolWithRelations,
} from "./entities/school";
export type { User, UserNoPassword } from "./entities/user";
export type { Teacher } from "./entities/teacher";
export type { Year, ProgramYear } from "./entities/year";
export type {
  Program,
  ProgramSubjectItem,
  ProgramWithRelations,
} from "./entities/program";
export type { Subject } from "./entities/subject";
export type {
  ProgramSubject,
  ProgramSubjectWithRelations,
} from "./entities/program-subject";

export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from "./requests/auth";
export type { CreateSchoolRequest } from "./requests/school";
export type { FindUserByEmailRequest } from "./requests/user";
export type { CreateTeacherRequest } from "./requests/teacher";
export type { CreateProgramRequest } from "./requests/program";
export type { CreateSubjectRequest } from "./requests/subject";
export type { CreateProgramSubjectRequest } from "./requests/program-subject";
export type {
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
} from "./requests/assignment";
