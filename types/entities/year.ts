import type { Timestamps } from "./common";

export interface Year extends Timestamps {
  id: number;
  name: string;
}

export interface ProgramYear extends Timestamps {
  yearId: number;
  numWeeks: number;
  year: Year;
}
