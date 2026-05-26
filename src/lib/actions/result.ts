import type { ZodError } from "zod";

export type ActionSuccess = { success: true; redirect?: string };
export type ActionFailure = {
  success: false;
  error?: string;
  fieldErrors?: Record<string, string>;
};
export type ActionResult = ActionSuccess | ActionFailure;

export function flattenZod<T>(err: ZodError<T>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
