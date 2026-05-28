import "server-only";
import { request } from "./client";
import type { AuthResponse, UserResponse } from "./types";

export type RegisterInput = {
  email: string;
  password: string;
  username: string;
};

export type LoginInput = { email: string; password: string };

export const authApi = {
  register: (body: RegisterInput) =>
    request<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body,
      auth: false,
    }),

  login: (body: LoginInput) =>
    request<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body,
      auth: false,
    }),

  logout: (refreshToken: string) =>
    request<void>("/v1/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  google: (idToken: string) =>
    request<AuthResponse>("/v1/auth/google", {
      method: "POST",
      body: { idToken },
      auth: false,
    }),

  apple: (idToken: string, fullName?: string) =>
    request<AuthResponse>("/v1/auth/apple", {
      method: "POST",
      body: fullName ? { idToken, fullName } : { idToken },
      auth: false,
    }),

  github: (code: string) =>
    request<AuthResponse>("/v1/auth/github", {
      method: "POST",
      body: { code },
      auth: false,
    }),

  me: () => request<UserResponse>("/v1/auth/me"),

  sendEmailVerification: () =>
    request<{ expiresAt: string }>("/v1/auth/email/send-verification", {
      method: "POST",
    }),

  verifyEmail: (code: string) =>
    request<UserResponse>("/v1/auth/email/verify", {
      method: "POST",
      body: { code },
    }),
};
