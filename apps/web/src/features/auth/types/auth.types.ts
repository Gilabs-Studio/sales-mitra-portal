export type Role = "super_admin" | "admin" | "partner";
export type ScopeRole = "admin" | "partner";

export function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "super_admin";
}

export function rolePath(role: Role): ScopeRole {
  return isAdminRole(role) ? "admin" : "partner";
}

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
