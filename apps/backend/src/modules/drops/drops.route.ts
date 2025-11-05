import { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as C from "./drops.controller";
import {
  dropIdParamSchema,
  createDropSchema,
  updateDropSchema,
} from "./drops.schema";

export default async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get("/drops", {}, C.getDrops);

  r.post("/drops/:id/join", { schema: { params: dropIdParamSchema } }, C.joinDrop);
  r.post("/drops/:id/leave", { schema: { params: dropIdParamSchema } }, C.leaveDrop);
  r.post("/drops/:id/claim", { schema: { params: dropIdParamSchema } }, C.claimDrop);

  r.post("/admin/drops", { schema: { body: createDropSchema } }, C.createDrop);
  r.put(
    "/admin/drops/:id",
    { schema: { params: dropIdParamSchema, body: updateDropSchema } },
    C.updateDrop
  );
  r.delete("/admin/drops/:id", { schema: { params: dropIdParamSchema } }, C.deleteDrop);
}
