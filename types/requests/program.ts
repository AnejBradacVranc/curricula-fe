export interface CreateProgramRequest {
  name: string;
}

export interface ImportProgramSubjectInput {
  requiredHours: number;
  subjectId?: number | null;
  name?: string;
  abbrevation?: string;
  categoryId?: number;
}

export interface ImportProgramYearInput {
  yearId: number;
  numWeeks: number;
  subjects: ImportProgramSubjectInput[];
}

export interface ImportProgramRequest {
  name: string;
  years: ImportProgramYearInput[];
}

export interface ResolvedExtractProgramSubject {
  name: string;
  abbrevation: string | null;
  categoryName: string | null;
  requiredHours: number;
  subjectId: number | null;
  isNew: boolean;
  categoryId: number | null;
}

export interface ResolvedExtractProgramYear {
  yearName: string;
  yearId: number | null;
  numWeeks: number;
  subjects: ResolvedExtractProgramSubject[];
}

export interface ResolvedExtractProgram {
  name: string;
  years: ResolvedExtractProgramYear[];
}
