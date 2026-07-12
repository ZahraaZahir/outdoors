export interface JwtPayload {
  sub: number;
  phoneNumber: string;
  role: string;
  type?: string;
}
