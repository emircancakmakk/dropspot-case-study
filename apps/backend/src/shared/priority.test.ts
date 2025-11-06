import { describe, it, expect, beforeEach } from "vitest";
import { computePriorityScore } from "./priority";

describe("computePriorityScore", () => {
  beforeEach(() => {
    process.env.DS_SEED = "670afcb359e7";
  });

  it("should return a deterministic score for same userId and dropId", () => {
    const userId = "user123";
    const dropId = "drop456";
    
    const score1 = computePriorityScore(userId, dropId);
    const score2 = computePriorityScore(userId, dropId);
    
    // Aynı girdiler için aynı skor dönmeli (deterministik)
    expect(score1).toBe(score2);
  });

  it("should return different scores for different userIds", () => {
    const dropId = "drop456";
    
    const score1 = computePriorityScore("user1", dropId);
    const score2 = computePriorityScore("user2", dropId);
    
    // Farklı kullanıcılar için farklı skorlar (genelde)
    expect(score1).not.toBe(score2);
  });

  it("should return different scores for different dropIds", () => {
    const userId = "user123";
    
    const score1 = computePriorityScore(userId, "drop1");
    const score2 = computePriorityScore(userId, "drop2");
    
    expect(score1).not.toBe(score2);
  });

  it("should return a score between 0 and 99 (base calculation)", () => {
    const score = computePriorityScore("user123", "drop456");
    
    // Base değer % 100 olduğu için 0-99 aralığında olmalı
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(100);
  });

  it("should handle optional parameters (even though not used)", () => {
    const userId = "user123";
    const dropId = "drop456";
    
    const scoreWithoutOpts = computePriorityScore(userId, dropId);
    const scoreWithOpts = computePriorityScore(userId, dropId, {
      signupLatencyMs: 100,
      accountAgeDays: 5,
      rapidActions: 2,
    });
    
    expect(scoreWithoutOpts).not.toBe(scoreWithOpts);
  });

  it("should produce consistent results across multiple calls", () => {
    const userId = "user123";
    const dropId = "drop456";
    
    const scores = Array.from({ length: 10 }, () => 
      computePriorityScore(userId, dropId)
    );
    
    // Tüm skorlar aynı olmalı (deterministik)
    const uniqueScores = new Set(scores);
    expect(uniqueScores.size).toBe(1);
  });
});

