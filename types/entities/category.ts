import type { Timestamps } from "./common";

export interface Category extends Timestamps {
  id: number;
  name: string;
}
