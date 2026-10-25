import type { Timestamps } from "./common";
import type { ProgramClass } from "./class";

export interface Year extends Timestamps {
  id: number;
  /** Grade number (1, 2, 3, 4…). Display as "X. letnik" via formatYearLabel. */
  year: number;
}

export interface ProgramYear extends Timestamps {
  yearId: number;
  numWeeks: number;
  year: Year;
  classes: ProgramClass[];
}
