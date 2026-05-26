export type UserResponse = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  isEmailVerified: boolean;
  isActive: boolean;
  isOnboarded: boolean;
  nativeLanguage: string | null;
  targetLanguage: string | null;
  proficiencyLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  dailyGoalMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? body?.error ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function isApiError(e: unknown, status?: number): e is ApiError {
  if (!(e instanceof ApiError)) return false;
  return status === undefined || e.status === status;
}
