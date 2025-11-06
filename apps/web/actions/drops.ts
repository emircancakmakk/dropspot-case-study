// actions/drops.ts
"use server";

import { revalidatePath } from "next/cache";
import { toISOFromLocal } from "@/lib/date";
import { deleteDrop, updateDrop } from "@/components/admin/drops/lib/api";

export async function updateDropAction(id: string, formData: FormData) {
  const payload = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    stock: Number(formData.get("stock")),
    claimStart: toISOFromLocal(formData.get("claimStart") as string),
    claimEnd: toISOFromLocal(formData.get("claimEnd") as string),
    isActive: formData.get("isActive") === "true",
  };

  await updateDrop(id, payload);
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteDropAction(id: string) {
  await deleteDrop(id);
  revalidatePath("/admin");
  return { ok: true as const };
}
