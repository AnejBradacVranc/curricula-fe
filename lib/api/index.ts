export { api, getAccessToken, setAccessToken } from "./axios";
export { unwrap } from "./unwrap";

export { getAppInfo } from "./app";

export { login, register, logout } from "./auth";

export { getSchools, getMySchool, createSchool } from "./schools";

export { getUsers, getUserByEmail } from "./users";

export { getTeachers, getTeacher, createTeacher, createTeachers, updateTeacher, deleteTeacher } from "./teachers";

export { extractTeachers, extractProgram } from "./extract";

export { exportTeacherPdf } from "./export";

export {
  getPrograms,
  getProgram,
  createProgram,
  importProgram,
  deleteProgram,
} from "./programs";

export { getSubjects, createSubject, updateSubject } from "./subjects";

export { getCategories } from "./categories";

export {
  getProgramSubjects,
  createProgramSubject,
  updateProgramSubject,
  deleteProgramSubject,
} from "./program-subjects";

export { getYears } from "./years";

export { createProgramYear, updateProgramYear } from "./program-years";

export { createClass, deleteClass } from "./classes";

export { assignTeacher, unassignTeacher } from "./assignments";
export {
  getAdditionalActivities,
  createAdditionalActivityAssignment,
  deleteAdditionalActivityAssignment,
} from "./additional-activities";
