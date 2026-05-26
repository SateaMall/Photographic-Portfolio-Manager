import { API_BASE, httpJson } from "./http";
export type AuthMeResponse = {
  authenticated: boolean;
  email?: string;
  profileSlug?: string;
  displayName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type VerifyEmailInput = {
  email: string;
  code: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};


export function getMe() {
  return httpJson<AuthMeResponse>("/api/auth/me", {
    method: "GET",
  });
}
export function login(input: LoginInput) {
  return httpJson<void>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getGoogleLoginUrl() {
  return `${API_BASE}/oauth2/authorization/google`;
}

export function logout() {
  return httpJson<void>("/api/auth/logout", {
    method: "POST",
  });
}
export function deleteCurrentUser() {
  return httpJson<{ message: string }>("/api/auth/me", {
    method: "DELETE",
  });
}
export function changeCurrentPassword(input: ChangePasswordInput) {
  return httpJson<{ message: string }>("/api/auth/me/password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export function forgotPassword(input: ForgotPasswordInput) {
  return httpJson<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function resetPassword(input: ResetPasswordInput) {
  return httpJson<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function signup(input: SignupInput) {
  return httpJson<{ message: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function verifyEmail(input: VerifyEmailInput) {
  return httpJson<{ message: string }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function resendVerificationCode(email: string) {
  const params = new URLSearchParams({ email });
  return httpJson<void>(`/api/auth/resend-code?${params.toString()}`, {
    method: "POST",
  });
}
