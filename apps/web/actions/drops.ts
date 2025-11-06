"use server"

import { api } from "@/lib/api"
import { createDrop, deleteDrop, updateDrop } from "@/components/admin/drops/lib/api"
import { toISOFromLocal } from "@/lib/date"
import { revalidatePath } from "next/cache"
import { ClaimDropResponse, JoinDropResponse, LeaveDropResponse } from "@/lib/types"

export async function updateDropAction(id: string, formData: FormData) {
  const payload = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    stock: Number(formData.get("stock")),
    claimStart: toISOFromLocal(formData.get("claimStart") as string),
    claimEnd: toISOFromLocal(formData.get("claimEnd") as string),
    isActive: formData.get("isActive") === "true",
  }

  await updateDrop(id, payload)
  revalidatePath("/admin")
  return { ok: true as const }
}

export async function deleteDropAction(id: string) {
  await deleteDrop(id)
  revalidatePath("/admin")
  return { ok: true as const }
}

export async function createDropAction(formData: FormData) {
  try {
    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim() || null
    const stock = Number(formData.get("stock") || 0)
    const claimStart = toISOFromLocal(formData.get("claimStart")?.toString() || "")
    const claimEnd = toISOFromLocal(formData.get("claimEnd")?.toString() || "")
    const isActive = String(formData.get("isActive") || "false") === "true"

    if (!title || !claimStart || !claimEnd || stock < 0) {
      return { ok: false, error: "Geçersiz alanlar" }
    }

    const now = new Date()
    const startDate = new Date(claimStart)
    const endDate = new Date(claimEnd)

    if (startDate < now) {
      return { ok: false, error: "Başlangıç tarihi geçmişte olamaz" }
    }

    if (endDate < now) {
      return { ok: false, error: "Bitiş tarihi geçmişte olamaz" }
    }

    if (endDate <= startDate) {
      return { ok: false, error: "Bitiş tarihi başlangıç tarihinden sonra olmalı" }
    }

    await createDrop({
      title,
      description: description || undefined,
      stock,
      claimStart,
      claimEnd,
      isActive,
    })

    revalidatePath("/admin")
    return { ok: true }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Sunucu hatası"
    return { ok: false, error: errorMessage }
  }
}

export async function joinDropAction(id: string) {
  return api<JoinDropResponse>(`/api/drops/${id}/join`, { method: "POST" })
}

export async function leaveDropAction(id: string) {
  return api<LeaveDropResponse>(`/api/drops/${id}/leave`, { method: "POST" })
}

export async function claimDropAction(id: string) {
  return api<ClaimDropResponse>(`/api/drops/${id}/claim`, { method: "POST" })
}