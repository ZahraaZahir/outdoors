import { Role } from '../../generated/prisma/enums.js';

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
  phoneNumber: string;
}

export interface AuthenticatedRequest {
  user?: UserPayload;
}
