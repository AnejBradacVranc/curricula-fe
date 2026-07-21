export { api, getAccessToken, setAccessToken } from "./axios";
export { unwrap } from "./unwrap";

export { getAppInfo } from "./app";

export { login, register, logout } from "./auth";

export { getSchools, getMySchool, createSchool } from "./schools";

export { getUsers, getUserByEmail } from "./users";

export { getTeachers, getTeacher, createTeacher } from "./teachers";

export { getPrograms, getProgram, createProgram, deleteProgram } from "./programs";

export { getSubjects, createSubject, updateSubject } from "./subjects";

export { getCategories } from "./categories";

export { getProgramSubjects, createProgramSubject, updateProgramSubject } from "./program-subjects";

export { getYears } from "./years";

export { createProgramYear, updateProgramYear } from "./program-years";

export { createClass, deleteClass } from "./classes";

export { assignTeacher, unassignTeacher } from "./assignments";
export {
  getAdditionalActivities,
  createAdditionalActivityAssignment,
  deleteAdditionalActivityAssignment,
} from "./additional-activities";
