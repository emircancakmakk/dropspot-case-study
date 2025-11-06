// claims.service.ts
import * as R from "./claim.repo";

export async function listUserClaims(userId: string) {
  const rows = await R.findClaimsByUser(userId);

  return rows
    .filter(r => r.claimCode && r.claimAt && r.drop)
    .map(r => ({
      dropId: r.drop.id,
      dropTitle: r.drop.title,
      claimCode: r.claimCode!,
      claimAt: r.claimAt!.toISOString(),
      claimWindow: {
        start: r.drop.claimStart.toISOString(),
        end: r.drop.claimEnd.toISOString(),
      },
    }));
}
