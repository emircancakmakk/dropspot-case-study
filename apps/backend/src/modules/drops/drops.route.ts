// src/modules/drops/drops.routes.ts
import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as C from "./drops.controller";
import {
  dropIdParamSchema,
  createDropSchema,
  updateDropSchema,
  claimDropResponseSchema,
} from "./drops.schema";
import { requireAuth, requireRoles } from "../auth/guards";

export default async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get("/drops", {}, C.getActiveDrops as any);

  r.get("/drops/:id", {}, C.getDrop as any);

  r.post(
    "/drops/:id/join",
    {
      preHandler: [requireAuth as any],
      schema: { params: dropIdParamSchema },
    },
    C.joinDrop as any
  );

  r.post(
    "/drops/:id/leave",
    {
      preHandler: [requireAuth as any],
      schema: { params: dropIdParamSchema },
    },
    C.leaveDrop as any
  );

  r.post(
    "/drops/:id/claim",
    {
      preHandler: [requireAuth as any],
      schema: {
        params: dropIdParamSchema,
        response: { 200: claimDropResponseSchema },
      },
    },
    C.claimDrop as any
  );

  r.post(
    "/admin/drops",
    {
      preHandler: [requireAuth as any, requireRoles("ADMIN") as any],
      schema: { body: createDropSchema },
    },
    C.createDrop as any
  );

  r.get(
    "/admin/drops",
    {
      preHandler: [requireAuth as any, requireRoles("ADMIN") as any],
    },
    C.getAllDrops as any
  );

  r.put(
    "/admin/drops/:id",
    {
      preHandler: [requireAuth as any, requireRoles("ADMIN") as any],
      schema: { params: dropIdParamSchema, body: updateDropSchema },
    },
    C.updateDrop as any
  );

  r.delete(
    "/admin/drops/:id",
    {
      preHandler: [requireAuth as any, requireRoles("ADMIN") as any],
      schema: { params: dropIdParamSchema },
    },
    C.deleteDrop as any
  );
}
