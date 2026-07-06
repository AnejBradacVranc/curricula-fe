import type { Timestamps } from "./common";
import type { ProgramClass } from "./class";

export interface Year extends Timestamps {
  id: number;
  name: string;
}

export interface ProgramYear extends Timestamps {
  yearId: number;
  numWeeks: number;
  year: Year;
  classes: ProgramClass[];
}
