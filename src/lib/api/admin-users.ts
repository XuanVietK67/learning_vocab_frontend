import "server-only";
import { request } from "./client";

export const adminUsersApi = {
  remove: (id: string) =>
    request<void>(`/v1/admin/users/${id}`, { method: "DELETE" }),
};
