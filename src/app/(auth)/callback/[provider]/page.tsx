import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CallbackView } from "./callback-view";

export const metadata: Metadata = { title: "Signing in… — Lexa" };

const ALLOWED = new Set(["google", "github", "apple"]);

export default async function CallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{ code?: string; state?: string; error?: string }>;
}) {
  const { provider } = await params;
  const sp = await searchParams;
  if (!ALLOWED.has(provider)) notFound();

  return (
    <CallbackView
      provider={provider as "google" | "github" | "apple"}
      code={sp.code}
      state={sp.state}
      providerError={sp.error}
    />
  );
}
