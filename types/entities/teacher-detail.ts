export interface TeacherDetailCategory {
  name: string;
}

export interface TeacherDetailSubject {
  name: string;
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

export interface TeacherDetailClassLabel {
  label: string;
}

export interface TeacherDetailClass {
  label: TeacherDetailClassLabel;
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
  schoolId: number;
  assignedHours: string | number;
  assignments: TeacherDetailAssignment[];
}
