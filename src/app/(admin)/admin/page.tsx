import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Lexa" };

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-semibold italic text-ink">
        hello admin
      </h1>
    </div>
  );
}
