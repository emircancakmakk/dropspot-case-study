// src/server.ts
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import prismaPlugin from "./plugins/prisma";
import authRoutes from "./modules/auth";
import dropRoutes from "./modules/drops";
import claimRoutes from "./modules/claim";
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { AppError } from "./shared/errors";
import jwt from "@fastify/jwt";

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(prismaPlugin);

await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
});

app.setErrorHandler((err, req, reply) => {
  const jwtCodes = new Set([
    "FST_JWT_NO_AUTHORIZATION_IN_HEADER",
    "FST_JWT_BAD_AUTHORIZATION_HEADER",
    "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
    "FST_JWT_AUTHORIZATION_TOKEN_INVALID",
    "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
  ]);
  if ((err as any).code && jwtCodes.has((err as any).code)) {
    req.log.info({ code: (err as any).code }, "jwt_error");
    return reply.code(401).send({ error: "unauthorized" });
  }

  if (err instanceof AppError) {
    req.log.warn({ code: err.code }, err.message);
    return reply.code(err.status).send({ error: err.code, message: err.message });
  }

  const v = (err as any).validation;
  if (v) {
    const details = v.map((e: any) => ({
      instancePath: e.instancePath,
      message: e.message,
      keyword: e.keyword,
      params: e.params,
    }));
    req.log.info({ validation: details }, "validation_error");
    return reply.code(400).send({ error: "validation_error", message: "İstek geçerli değil.", details: v });
  }

  if ((err as any).code === "FST_ERR_NOT_FOUND") {
    req.log.info({ url: req.url }, "not_found");
    return reply.code(404).send({ error: "not_found" });
  }

  req.log.error(err, "internal_error");
  reply.code(500).send({ error: "internal_error", message: "Beklenmeyen bir hata oluştu." });
});

await app.register(authRoutes, { prefix: "/api" });
await app.register(async (scope) => {
  const r = scope.withTypeProvider<ZodTypeProvider>();
  await dropRoutes(r);
}, { prefix: "/api" });
await app.register(async (scope) => {
  const r = scope.withTypeProvider<ZodTypeProvider>();
  await claimRoutes(r);
}, { prefix: "/api" });

const port = Number(process.env.PORT ?? 5050);
const host = process.env.HOST ?? "0.0.0.0";
await app.listen({ port, host });
