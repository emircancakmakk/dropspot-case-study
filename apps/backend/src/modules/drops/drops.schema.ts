import { z } from "zod";

/**
 * Parametrelerde kullanılacak ID şeması
 */
export const dropIdParamSchema = z.object({
  id: z.string().cuid("Geçersiz drop ID'si"),
}).strict();

/**
 * Drop'a katılma isteği gövdesi
 */
export const joinDropBodySchema = z.object({
  userId: z.string().min(1),
}).strict();

/**
 * Drop'tan ayrılma isteği gövdesi
 */
export const leaveDropBodySchema = z.object({
  userId: z.string().min(1),
}).strict();

/**
 * Drop claim etme isteği gövdesi
 */
export const claimDropBodySchema = z.object({
  userId: z.string().min(1),
}).strict();


/**
 * Drop claim etme yanıt modeli
 */
export const claimDropResponseSchema = z.object({
  status: z.enum(["claimed", "already_claimed"]),
  claimCode: z.string(),
});

/**
 * Drop'a katılma yanıt modeli
 */
export const joinDropResponseSchema = z.object({
  wait: z.object({
    id: z.string(),
    userId: z.string(),
    dropId: z.string(),
    priorityScore: z.number(),
    joinedAt: z.string().datetime(),
    claimed: z.boolean(),
  })
});

/**
 * Yeni drop oluşturma isteği
 */
export const createDropSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().optional(),
  stock: z.number().int().positive("Stok pozitif bir tam sayı olmalı"),
  claimStart: z.string().datetime("Talep başlangıcı ISO tarih dizesi olmalı"),
  claimEnd: z.string().datetime("Talep bitişi ISO tarih dizesi olmalı"),
}).strict();

/**
 * Güncelleme isteği (partial)
 */
export const updateDropSchema = createDropSchema.partial().strict();

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
export type DropListResponse = z.infer<typeof dropListResponseSchema>;
export type JoinDropBody = z.infer<typeof joinDropBodySchema>;
export type LeaveDropBody = z.infer<typeof leaveDropBodySchema>;
export type ClaimDropBody = z.infer<typeof claimDropBodySchema>;


