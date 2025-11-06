import { api } from "@/lib/api";
import {
  CreateDropInput,
  CreateDropResponse,
  Drop,
  UpdateDropResponse,
} from "@/lib/types";

export async function listDrops() {
  return await api<Drop[]>("/api/admin/drops");
}

export async function createDrop(data: CreateDropInput) {
  return await api<CreateDropResponse>("/api/admin/drops", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDrop(id: string, data: Partial<CreateDropInput>) {
  return await api<UpdateDropResponse>(`/api/admin/drops/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDrop(id: string) {
  return await api(`/api/admin/drops/${id}`, { method: "DELETE" });
}
