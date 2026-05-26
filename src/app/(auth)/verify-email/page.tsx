import type { Metadata } from "next";
import { VerifyEmailView } from "./verify-view";

export const metadata: Metadata = { title: "Verify your email — Lexa" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailView email={email ?? "you@studyhall.co"} />;
}
