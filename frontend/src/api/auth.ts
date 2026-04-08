import { httpJson} from "./http";
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
export function logout() {
  return httpJson<void>("/api/auth/logout", {
    method: "POST",
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
