import type { Timestamps } from "./common";
import type { Role } from "../enums/role";

export interface User extends Timestamps {
  id: number;
  email: string;
  name: string | null;
  surname: string | null;
  schoolId: number;
  role: Role;
  password: string;
}

export type UserNoPassword = Omit<User, "password">;
