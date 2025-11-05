// src/server.ts
import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma";
import authRoutes from "./modules/auth";
import dropRoutes from "./modules/drops";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import { AppError } from "./shared/errors";

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(prismaPlugin);

app.setErrorHandler((err, req, reply) => {
  // 1) Domain hataları
  if (err instanceof AppError) {
    req.log.warn({ code: err.code }, err.message);
    return reply
      .code(err.status)
      .send({ error: err.code, message: err.message });
  }

  // 2) Zod/Fastify doğrulama hataları
  // fastify-type-provider-zod, fastify'nin validation alanını doldurur
  const v = (err as any).validation;
  if (v) {
    // örnek: alan bazlı detayları eklemek istersen:
    const details = v.map((e: any) => ({
      instancePath: e.instancePath, // ajv kullanılıyorsa
      message: e.message,
      keyword: e.keyword,
      params: e.params,
    }));
    req.log.info({ validation: details }, "validation_error");
    return reply.code(400).send({
      error: "validation_error",
      message: "İstek geçerli değil.",
      details: v,
    });
  }

  // 3) Bulunamadı (route yok)
  if ((err as any).code === "FST_ERR_NOT_FOUND") {
    req.log.info({ url: req.url }, "not_found");
    return reply.code(404).send({ error: "not_found" });
  }

  // 4) Diğer beklenmeyen hatalar
  req.log.error(err, "internal_error");
  reply.code(500).send({
    error: "internal_error",
    message: "Beklenmeyen bir hata oluştu.",
  });
});

await app.register(authRoutes, { prefix: "/api" });
await app.register(dropRoutes, { prefix: "/api" });

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
await app.listen({ port, host });
