export type Role = "super_admin" | "admin" | "partner" | "client";
export type ScopeRole = "admin" | "partner" | "client";

export function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "super_admin";
}

export function rolePath(role: Role): ScopeRole {
  if (isAdminRole(role)) return "admin";
  if (role === "client") return "client";
  return "partner";
}

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  partnerCode: string;
  isSuspended: boolean;
  suspendedReason: string;
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

export type PasswordResetRequestPayload = {
  email: string;
};

export type PasswordResetConfirmPayload = {
  token: string;
  password: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};
