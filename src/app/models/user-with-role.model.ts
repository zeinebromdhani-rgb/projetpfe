// src/app/models/user-with-role.model.ts

import { UserRole } from './user-role.enum';

export interface UserWithRole {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}
