import type { Request } from 'express';

export interface UserPayload {
  id: number;
  phoneNumber: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
