import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { MarketingHero } from "./_hero/marketing-hero";
import { HomeDashboard } from "./_home/home-dashboard";

export default async function HomePage() {
  const user = await getCurrentUser();

  // Admins don't have a learner home — send them to their dashboard.
  if (user?.role === "admin") redirect("/admin");

  // Guests and partially-onboarded users still see the landing hero — the
  // layout header handles sign-in vs username display. The onboarding gate
  // lives on /onboarding itself, not here.
  if (!user || !user.isOnboarded) {
    return <MarketingHero />;
  }

  return <HomeDashboard user={user} />;
}
