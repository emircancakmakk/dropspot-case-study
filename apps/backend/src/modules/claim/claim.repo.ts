import { prisma } from "../../plugins/prisma";

export type ClaimRow = {
  claimCode: string | null;
  claimAt: Date | null;
  drop: { id: string; title: string; claimStart: Date; claimEnd: Date };
};

export async function findClaimsByUser(userId: string): Promise<ClaimRow[]> {
  return prisma.waitlist.findMany({
    where: { userId, claimed: true },
    select: {
      claimCode: true,
      claimAt: true,
      drop: {
        select: { id: true, title: true, claimStart: true, claimEnd: true },
      },
    },
    orderBy: { claimAt: "desc" },
  });
}
