// Vitest setup for backend tests
import { beforeAll, afterAll } from "vitest";
import { prisma } from "./src/plugins/prisma";

beforeAll(async () => {
  // Test veritabanı bağlantısını kontrol et
  await prisma.$connect();
});

afterAll(async () => {
  // Test sonrası temizlik
  await prisma.$disconnect();
});

