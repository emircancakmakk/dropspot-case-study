// src/modules/drops/drops.routes.ts
import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as C from "./claim.controller";
import { requireAuth } from "../../shared/guards";
import { myClaimsResponseSchema } from "./claim.schema";

export default async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/me/claims",
    {
      preHandler: [requireAuth as any],
      schema: { response: { 200: myClaimsResponseSchema } },
    },
    C.listMyClaims as any
  );
  
}
