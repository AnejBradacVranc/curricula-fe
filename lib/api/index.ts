export { api, setAccessToken } from "./axios";
export { unwrap } from "./unwrap";

export { getAppInfo } from "./app";

export { login, register, logout } from "./auth";

export { getSchools, getMySchool, createSchool } from "./schools";

export { getUsers, getUserByEmail } from "./users";

export { getTeachers, createTeacher } from "./teachers";

export { getPrograms, createProgram } from "./programs";

export { getSubjects, createSubject } from "./subjects";

export { getProgramSubjects, createProgramSubject } from "./program-subjects";

export { getAssignments, createAssignment, deleteAssignment } from "./assignments";
