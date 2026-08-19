type Role = 'ADMIN' | 'EMPLOYEE';

export type Account = {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId?: number | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  account: Account;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  firstName: string;
  lastName: string;
  middleName?: string;
};
