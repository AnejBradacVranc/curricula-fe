import type { Category } from "./category";
import type { Timestamps } from "./common";

export interface Subject extends Timestamps {
  id: number;
  name: string;
  abbrevation: string;
  schoolId: number;
  categoryId: number;
  category: Category;
}
