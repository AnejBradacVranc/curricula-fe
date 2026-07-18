export interface TeacherDetailAdditionalActivity {
  name: string;
}

export interface TeacherDetailAdditionalActivityAssignment {
  additionalActivityId: number;
  hoursAmount: string | number;
  additionalActivity: TeacherDetailAdditionalActivity;
}

export interface TeacherDetailCategory {
  name: string;
}

export interface TeacherDetailSubject {
  name: string;
  abbrevation: string;
  category: TeacherDetailCategory;
}

export interface TeacherDetailProgramSubject {
  requiredHours: string | number;
  subject: TeacherDetailSubject;
}

export interface TeacherDetailYear {
  name: string;
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
  email: string;
  color: string | null;
  schoolId: number;
  assignedHours: string | number;
  additionalActivityHours: string | number;
  totalHours: string | number;
  assignments: TeacherDetailAssignment[];
  additionalActivityAssignments: TeacherDetailAdditionalActivityAssignment[];
}
