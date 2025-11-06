import { z } from "zod";

export const myClaimItemSchema = z.object({
  dropId: z.string(),
  dropTitle: z.string(),
  claimCode: z.string(),
  claimAt: z.string().datetime(),
  claimWindow: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});
export const myClaimsResponseSchema = z.array(myClaimItemSchema);
