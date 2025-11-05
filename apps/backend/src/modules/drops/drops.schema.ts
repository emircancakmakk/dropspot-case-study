import { z } from "zod";

/**
 * Parametrelerde kullanılacak ID şeması
 */
export const dropIdParamSchema = z.object({
  id: z.string().cuid("invalid drop id"),
});

/**
 * Yeni drop oluşturma isteği
 */
export const createDropSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  stock: z.number().int().positive("stock must be positive"),
  claimStart: z.string().datetime("claimStart must be ISO date string"),
  claimEnd: z.string().datetime("claimEnd must be ISO date string"),
});

/**
 * Güncelleme isteği (partial)
 */
export const updateDropSchema = createDropSchema.partial();

/**
 * Drop yanıt modeli
 * (Prisma modelinden türetilmiş ama client’a gönderilebilir alanlarla sınırlı)
 */
export const dropResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  stock: z.number(),
  claimStart: z.string(),
  claimEnd: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

/**
 * Listeleme çıktısı
 */
export const dropListResponseSchema = z.array(dropResponseSchema);

/**
 * Tip çıkarımları (controller ve route tipleri için)
 */
export type DropIdParam = z.infer<typeof dropIdParamSchema>;
export type CreateDropInput = z.infer<typeof createDropSchema>;
export type UpdateDropInput = z.infer<typeof updateDropSchema>;
export type DropResponse = z.infer<typeof dropResponseSchema>;
