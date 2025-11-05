import crypto from "crypto";

const SEED = process.env.DS_SEED ?? "";

function deriveABC(seed: string) {
  const h = crypto.createHash("sha256").update(seed).digest("hex");
  const A = 7  + (parseInt(h.slice(0, 2), 16) % 5);  // 7..11
  const B = 13 + (parseInt(h.slice(2, 4), 16) % 7);  // 13..19
  const C = 3  + (parseInt(h.slice(4, 6), 16) % 3);  // 3..5
  return { A, B, C, h };
}

export function computePriorityScore(userId: string, dropId: string, opts?: {
  signupLatencyMs?: number;     // yoksa 0
  accountAgeDays?: number;      // yoksa 0
  rapidActions?: number;        // yoksa 0
}) {
  const { A, B, C } = deriveABC(SEED);
  const signupLatencyMs = opts?.signupLatencyMs ?? 0;
  const accountAgeDays  = opts?.accountAgeDays  ?? 0;
  const rapidActions    = opts?.rapidActions    ?? 0;

  const base = parseInt(
    crypto.createHash("sha256")
      .update(`${userId}:${dropId}:${SEED}`)
      .digest("hex")
      .slice(0, 6),
    16
  ) % 100;

  return base + (signupLatencyMs % A) + (accountAgeDays % B) - (rapidActions % C);
}
