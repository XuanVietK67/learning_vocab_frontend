"use server";

import { revalidatePath } from "next/cache";
import { adminUsersApi } from "@/lib/api/admin-users";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";
import { type ActionResult } from "./result";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "You're signed out." };
  if (user.role !== "admin") return { success: false, error: "Admins only." };

  if (!UUID.test(id)) {
    return { success: false, fieldErrors: { id: "Must be a UUID." } };
  }

  if (id === user.id) {
    return { success: false, error: "You can't delete your own account from here." };
  }

  try {
    await adminUsersApi.remove(id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    if (isApiError(e, 403)) {
      return { success: false, error: "Backend rejected — cannot delete an admin account." };
    }
    if (isApiError(e, 404)) {
      return { success: false, error: "No user with that ID." };
    }
    return { success: false, error: "Could not delete user." };
  }
}
