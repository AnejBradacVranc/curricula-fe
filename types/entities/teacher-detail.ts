export interface TeacherDetailAdditionalActivity {
  name: string;
}

export interface TeacherDetailAdditionalActivityAssignment {
  additionalActivityId: number;
  hoursAmount: string | number;
  additionalActivity: TeacherDetailAdditionalActivity;
}

export interface TeacherDetailCategory {
  id: number;
  name: string;
}

export interface TeacherDetailSubject {
  name: string;
  abbrevation: string;
  category: TeacherDetailCategory;
}

export interface TeacherDetailProgram {
  id: number;
  name: string;
}

export interface TeacherDetailProgramSubject {
  requiredHours: string | number;
  program: TeacherDetailProgram;
  subject: TeacherDetailSubject;
}

export interface TeacherDetailYear {
  id: number;
  year: number;
}

export interface TeacherDetailProgramYear {
  numWeeks: number;
  year: TeacherDetailYear;
}

export interface TeacherDetailClass {
  label: string;
  programYear: TeacherDetailProgramYear;
}

export interface TeacherDetailAssignment {
  class: TeacherDetailClass;
  programSubject: TeacherDetailProgramSubject;
}

export interface TeacherDetail {
  id: number;
  name: string;
  surname: string;
  email: string | null;
  color: string | null;
  profileImage: string | null;
  schoolId: number;
  assignedHours: string | number;
  additionalActivityHours: string | number;
  totalHours: string | number;
  assignments: TeacherDetailAssignment[];
  additionalActivityAssignments: TeacherDetailAdditionalActivityAssignment[];
}
