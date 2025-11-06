import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../../test-utils/build-app";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../plugins/prisma";

describe("Drops Integration Tests", () => {
  let app: FastifyInstance;
  let testUserId: string;
  let testDropId: string;
  let authToken: string;

  beforeAll(async () => {
    process.env.DS_SEED = "670afcb359e7";
    process.env.JWT_SECRET = "test-secret";
    
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await prisma.waitlist.deleteMany({});
    await prisma.drop.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await prisma.waitlist.deleteMany({});
    await prisma.drop.deleteMany({});
    await prisma.user.deleteMany({});

    const signupResponse = await app.inject({
      method: "POST",
      url: "/api/auth/signup",
      payload: {
        email: `test-${Date.now()}@example.com`,
        password: "test123456",
        fullName: "Test User",
      },
    });

    expect(signupResponse.statusCode).toBe(201);
    const signupData = JSON.parse(signupResponse.body);
    testUserId = signupData.user.id;
    authToken = signupData.accessToken;

    const now = new Date();
    const claimStart = new Date(now.getTime() + 1000); // 1 saniye sonra
    const claimEnd = new Date(now.getTime() + 3600000); // 1 saat sonra

    const drop = await prisma.drop.create({
      data: {
        title: "Test Drop",
        description: "Test Description",
        stock: 5,
        claimStart,
        claimEnd,
        isActive: true,
      },
    });
    testDropId = drop.id;

    await new Promise((resolve) => setTimeout(resolve, 1500));
  });

  it("should allow user to join waitlist", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.status).toBe("joined");
    expect(data.wait.userId).toBe(testUserId);
    expect(data.wait.dropId).toBe(testDropId);
  });

  it("should be idempotent when joining waitlist multiple times", async () => {
    const response1 = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response1.statusCode).toBe(200);
    const data1 = JSON.parse(response1.body);
    expect(data1.status).toBe("joined");

    const response2 = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response2.statusCode).toBe(200);
    const data2 = JSON.parse(response2.body);
    expect(data2.status).toBe("already_joined");
    
    expect(data1.wait.id).toBe(data2.wait.id);
  });

  it("should allow user to leave waitlist", async () => {
    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/leave`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.status).toBe("left");
  });

  it("should be idempotent when leaving waitlist without joining", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/leave`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.status).toBe("not_in_waitlist");
  });

  it("should allow user to claim when eligible", async () => {
    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/claim`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.status).toBe("claimed");
    expect(data.claimCode).toBeDefined();
    expect(typeof data.claimCode).toBe("string");
  });

  it("should be idempotent when claiming multiple times", async () => {
    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    const response1 = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/claim`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response1.statusCode).toBe(200);
    const data1 = JSON.parse(response1.body);
    expect(data1.status).toBe("claimed");
    const claimCode1 = data1.claimCode;

    const response2 = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/claim`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response2.statusCode).toBe(200);
    const data2 = JSON.parse(response2.body);
    expect(data2.status).toBe("already_claimed");
    expect(data2.claimCode).toBe(claimCode1);
  });

  it("should handle edge case: claim when stock is full", async () => {
    await prisma.drop.update({
      where: { id: testDropId },
      data: { stock: 1 },
    });

    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/claim`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    const signupResponse2 = await app.inject({
      method: "POST",
      url: "/api/auth/signup",
      payload: {
        email: `test2-${Date.now()}@example.com`,
        password: "test123456",
        fullName: "Test User 2",
      },
    });

    const signupData2 = JSON.parse(signupResponse2.body);
    const authToken2 = signupData2.accessToken;

    await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/join`,
      headers: {
        authorization: `Bearer ${authToken2}`,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/drops/${testDropId}/claim`,
      headers: {
        authorization: `Bearer ${authToken2}`,
      },
    });

    expect(response.statusCode).toBe(409);
    const data = JSON.parse(response.body);
    expect(data.error).toBe("not_eligible");
  });
});

