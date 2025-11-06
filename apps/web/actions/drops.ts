// actions/drops.ts
"use server";

import { createDrop, deleteDrop, updateDrop } from "@/components/admin/drops/lib/api";
import { toISOFromLocal } from "@/lib/date";
import { revalidatePath } from "next/cache";

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

export async function createDropAction(formData: FormData) {
  try {
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    const stock = Number(formData.get("stock") || 0);
    const claimStart = toISOFromLocal(formData.get("claimStart")?.toString() || "");
    const claimEnd = toISOFromLocal(formData.get("claimEnd")?.toString() || "");
    const isActive = String(formData.get("isActive") || "false") === "true";

    if (!title || !claimStart || !claimEnd || stock < 0) {
      return { ok: false, error: "Geçersiz alanlar" };
    }

    await createDrop({
      title,
      description: description || undefined,
      stock,
      claimStart,
      claimEnd,
      isActive,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Sunucu hatası";
    return { ok: false, error: errorMessage };
  }
}