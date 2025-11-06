// Test için Fastify app oluşturma helper'ı
import Fastify, { FastifyInstance } from "fastify";
import prismaPlugin from "../plugins/prisma";
import authRoutes from "../modules/auth";
import dropRoutes from "../modules/drops";
import claimRoutes from "../modules/claim";
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { AppError } from "../shared/errors";
import jwt from "@fastify/jwt";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(prismaPlugin);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "test-secret",
    sign: { expiresIn: "15m" },
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
      return reply.code(401).send({ error: "unauthorized" });
    }

    if (err instanceof AppError) {
      return reply.code(err.status).send({ error: err.code, message: err.message });
    }

    const v = (err as any).validation;
    if (v) {
      return reply.code(400).send({ error: "validation_error", message: "İstek geçerli değil.", details: v });
    }

    if ((err as any).code === "FST_ERR_NOT_FOUND") {
      return reply.code(404).send({ error: "not_found" });
    }

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

  return app;
}

