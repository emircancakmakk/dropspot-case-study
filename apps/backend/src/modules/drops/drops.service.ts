import { AppError } from "../../shared/errors";
import { computePriorityScore } from "../../shared/priority";
import * as R from "./drop.repo";
import { CreateDropInput, DropIdParam, UpdateDropInput } from "./drops.schema";
import { prisma } from "../../plugins/prisma";
import * as crypto from "crypto";

export type JoinResult = {
  status: "joined" | "already_joined";
  wait: {
    id: string;
    userId: string;
    dropId: string;
    priorityScore: number;
    joinedAt: Date;
    claimed: boolean;
    claimCode: string | null;
  };
};
export type LeaveResult = "left" | "not_in_waitlist";

function genCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function listActiveDrops() {
  return R.findActiveDrops();
}

export async function createDrop(input: CreateDropInput) {
  const { claimStart, claimEnd } = input;

  const start = new Date(claimStart);
  const end = new Date(claimEnd);

  if (end <= start)
    throw new AppError(
      400,
      "invalid_claim_period",
      "Bitiş, başlangıçtan önce olamaz."
    );

  const drop = await R.insertDrop(input);

  return drop;
}

export async function updateDrop(id: string, input: UpdateDropInput) {
  if (input.claimStart && input.claimEnd) {
    const start = new Date(input.claimStart);
    const end = new Date(input.claimEnd);

    if (end <= start)
      throw new AppError(
        400,
        "invalid_claim_period",
        "Bitiş, başlangıçtan önce olamaz."
      );
  }

  const drop = await R.updateDropById(id, input);

  return drop;
}

export async function deleteDrop(id: string) {
  const exists = await R.findDropById(id);
  if (!exists) throw new AppError(422, "drop_not_found", "Drop bulunamadı.");

  await R.deleteDropById(id);
}

export async function joinWaitlist(
  userId: string,
  dropId: string
): Promise<JoinResult> {
  return prisma.$transaction(async (tx) => {
    const drop = await tx.drop.findUnique({ where: { id: dropId } });
    if (!drop) throw new AppError(422, "drop_not_found", "Drop bulunamadı.");
    if (!drop.isActive)
      throw new AppError(400, "drop_inactive", "Drop aktif değil.");

    const now = new Date();

    if (now.getTime() > drop.claimStart.getTime())
    {
      throw new AppError(400, "waitlist_closed", "Bekleme listesi kapandı.");
    }

    const existing = await tx.waitlist.findUnique({
      where: { userId_dropId: { userId, dropId } },
    });
    if (existing) return { status: "already_joined", wait: existing };

    const priorityScore = computePriorityScore(userId, dropId);

    try {
      const wait = await tx.waitlist.create({
        data: { userId, dropId, priorityScore },
      });
      return { status: "joined", wait };
    } catch (err: any) {
      if (err?.code === "P2002") {
        const again = await tx.waitlist.findUnique({
          where: { userId_dropId: { userId, dropId } },
        });
        if (again) return { status: "already_joined", wait: again };
      }
      throw err;
    }
  });
}

export async function leaveWaitlist(
  userId: string,
  dropId: string
): Promise<LeaveResult> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.waitlist.findUnique({
      where: { userId_dropId: { userId, dropId } },
      select: { id: true, claimed: true },
    });

    if (!row) return "not_in_waitlist";
    if (row.claimed) {
      throw new AppError(
        409,
        "already_claimed",
        "Claim edilmiş kayıttan ayrılamazsınız."
      );
    }

    await tx.waitlist.delete({
      where: { userId_dropId: { userId, dropId } },
    });

    return "left";
  });
}

export async function claimDrop(userId: string, dropId: string) {
  return prisma.$transaction(async (tx) => {
    const drop = await R.getDropForClaim(tx, dropId);
    if (!drop) throw new AppError(422, "drop_not_found", "Drop bulunamadı.");
    if (!drop.isActive)
      throw new AppError(409, "drop_inactive", "Drop aktif değil.");

    const now = new Date();
    if (now < drop.claimStart || now > drop.claimEnd) {
      throw new AppError(409, "claim_window_closed", "Claim penceresi kapalı.");
    }

    const me = await R.getWaitlistEntry(tx, userId, dropId);
    if (!me)
      throw new AppError(
        422,
        "not_on_waitlist",
        "Bekleme listesinde değilsiniz."
      );

    if (me.claimed) {
      return { status: "already_claimed" as const, claimCode: me.claimCode };
    }

    const beforeMe = await R.countBeforeMe(
      tx,
      dropId,
      me.priorityScore,
      me.joinedAt
    );

    const eligible = beforeMe <= drop.stock;
    if (!eligible)
      throw new AppError(409, "not_eligible", "Sıranız stok içinde değil.");

    const code = genCode();

    const updated = await R.markClaimedIfNot(tx, me.id, code);
    if (updated.count === 0) {
      const again = await R.getWaitlistEntry(tx, userId, dropId);
      if (again?.claimed && again.claimCode) {
        return {
          status: "already_claimed" as const,
          claimCode: again.claimCode,
        };
      }
      throw new AppError(409, "race_conflict", "Yarış durumu, tekrar deneyin.");
    }

    return { status: "claimed" as const, claimCode: code };
  });
}

export async function getDropById(id: string) {
  const drop = await R.findDropById(id);
  if (!drop) throw new AppError(422, "drop_not_found", "Drop bulunamadı.");

  return drop;
}

export async function listAllDrops() {
  return R.findAllDrops();
}

export async function getDropWithUserStatus(dropId: string, userId: string) {
  const drop = await R.findDropById(dropId);
  if (!drop) throw new AppError(422, "drop_not_found", "Drop bulunamadı.");

  const userJoined = await R.isUserInWaitlist(dropId, userId);
  const userClaimed = await R.hasUserClaimed(dropId, userId);

  return { ...drop, userJoined, userClaimed };
}
