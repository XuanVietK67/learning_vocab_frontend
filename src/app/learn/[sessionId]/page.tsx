import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SessionPlayer } from "./_player/session-player";

export const metadata = {
  title: "Learning session — Lexa",
};

export default async function LearnSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/");
  if (!user.isOnboarded) redirect("/onboarding");

  const { sessionId } = await params;

  // `key` forces a clean remount when "another round" swaps in a new session id.
  return <SessionPlayer key={sessionId} sessionId={sessionId} />;
}
