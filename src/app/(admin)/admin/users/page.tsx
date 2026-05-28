import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Card } from "../../_shell/card";
import { PageHeader } from "../../_shell/page-header";
import { DeleteUserForm } from "./_components/delete-user-form";

export const metadata: Metadata = { title: "Users — Lexa admin" };

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Users"
        description="Delete user accounts by ID."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />

      <Card className="mb-4 border-warn/30">
        <div className="flex gap-3">
          <Info className="size-4 shrink-0 text-warn" aria-hidden />
          <div className="text-sm text-ink-2">
            <p className="font-semibold">No user listing yet.</p>
            <p className="mt-1 text-muted-foreground">
              The backend only exposes <span className="font-mono">DELETE /v1/admin/users/:id</span>. To find a user&apos;s
              ID, grab it from the database or from an existing API response. A full list endpoint will land here once
              the backend ships one.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold italic text-ink">Delete by ID</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste a user UUID below. You&apos;ll be asked to confirm.
        </p>
        <div className="mt-4">
          <DeleteUserForm />
        </div>
      </Card>
    </div>
  );
}
