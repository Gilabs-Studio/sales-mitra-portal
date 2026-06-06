export type Role = "admin" | "partner";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  partnerCode: string;
  createdAt: string;
};

export type AuthResult = {
  token: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};
