import { Role } from '../../../generated/prisma/index.js';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};
