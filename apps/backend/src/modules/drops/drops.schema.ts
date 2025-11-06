import { z } from "zod";

export const dropIdParamSchema = z.object({
  id: z.string().cuid("Geçersiz drop ID'si"),
}).strict();

export const claimDropResponseSchema = z.object({
  status: z.enum(["claimed", "already_claimed"]),
  claimCode: z.string(),
});

export const joinDropResponseSchema = z.object({
  status: z.enum(["joined", "already_joined"]),
  wait: z.object({
    id: z.string(),
    userId: z.string(),
    dropId: z.string(),
    joinedAt: z.string().datetime(),
  })
});

export const createDropSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().optional(),
  stock: z.number().int().positive("Stok pozitif bir tam sayı olmalı"),
  claimStart: z.string().datetime("Talep başlangıcı ISO tarih dizesi olmalı"),
  claimEnd: z.string().datetime("Talep bitişi ISO tarih dizesi olmalı"),
  isActive: z.boolean().optional(),
}).strict();

export const updateDropSchema = createDropSchema.partial().strict();

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

export const leaveDropResponseSchema = z.object({
  status: z.enum(["left", "not_in_waitlist"]),
});


export const dropListResponseSchema = z.array(dropResponseSchema);

export type DropIdParam = z.infer<typeof dropIdParamSchema>;
export type CreateDropInput = z.infer<typeof createDropSchema>;
export type UpdateDropInput = z.infer<typeof updateDropSchema>;
export type DropResponse = z.infer<typeof dropResponseSchema>;
export type DropListResponse = z.infer<typeof dropListResponseSchema>;


