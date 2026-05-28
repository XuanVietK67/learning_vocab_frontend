import { z } from "zod";

const emailField = z
  .string()
  .min(1, "Enter your email.")
  .email("That doesn't look like an email address.");

const passwordField = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

export const SignInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});
export type SignInInput = z.infer<typeof SignInSchema>;

export const MagicLinkSchema = z.object({ email: emailField });
export type MagicLinkInput = z.infer<typeof MagicLinkSchema>;

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "3 characters minimum.")
    .max(30, "30 characters max.")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore only."),
  email: emailField,
  password: passwordField,
  accept: z.literal(true, { message: "Please accept the terms to continue." }),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ForgotSchema = z.object({ email: emailField });
export type ForgotInput = z.infer<typeof ForgotSchema>;

export const ResetSchema = z
  .object({
    token: z.string().min(1),
    password: passwordField,
    confirm: z.string().min(1, "Confirm your password."),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });
export type ResetInput = z.infer<typeof ResetSchema>;

export const OtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});
export type OtpInput = z.infer<typeof OtpSchema>;
