import { AppError } from "../../shared/errors";
import { computePriorityScore } from "../../shared/priority";
import * as R from "./drop.repo";
import { CreateDropInput, DropIdParam, UpdateDropInput } from "./drops.schema";
import { prisma } from "../../plugins/prisma";
import * as crypto from 'crypto';

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
  if (!exists)
    throw new AppError(404, "drop_not_found", "Drop bulunamadı.");

  await R.deleteDropById(id);
}

export async function joinWaitlist(userId: string, dropId: string)
{
  const drop = await R.isDropActive(dropId);

  if (!drop)
  {
    throw new AppError(404, "drop_not_found", "Drop bulunamadı.");
  }

  if (!drop.isActive)
  {
    throw new AppError(400, "drop_inactive", "Drop aktif değil.");
  }

  const priorityScore = computePriorityScore(userId, dropId);

  const waitEntry = await R.upsertWaitlist({
    userId,
    dropId,
    priorityScore,
  });

  return waitEntry;
}

export async function leaveWaitlist(userId: string, dropId: string)
{
  const state = await R.getWaitlistClaimState(userId, dropId);

  if (state?.claimed) {
    throw new AppError(409, "already_claimed", "Claim edilmiş kayıttan ayrılamazsınız.");
  }

  await R.deleteWaitlistEntry(userId, dropId);
}

export async function claimDrop(userId: string, dropId: string) {
  return prisma.$transaction(async (tx) => {
    const drop = await R.getDropForClaim(tx, dropId);
    if (!drop) throw new AppError(404, "drop_not_found", "Drop bulunamadı.");
    if (!drop.isActive) throw new AppError(409, "drop_inactive", "Drop aktif değil.");

    const now = new Date();
    if (now < drop.claimStart || now > drop.claimEnd) {
      throw new AppError(409, "claim_window_closed", "Claim penceresi kapalı.");
    }

    const me = await R.getWaitlistEntry(tx, userId, dropId);
    if (!me) throw new AppError(404, "not_on_waitlist", "Bekleme listesinde değilsiniz.");

    // Daha önce claim etmişse aynı kodla dön
    if (me.claimed && me.claimCode) {
      return { status: "already_claimed" as const, claimCode: me.claimCode };
    }

    const beforeMe = await R.countBeforeMe(tx, dropId, me.priorityScore, me.joinedAt);
    const claimedCount = await R.countClaimed(tx, dropId);

    const eligible = beforeMe < drop.stock && claimedCount < drop.stock;
    if (!eligible) throw new AppError(409, "not_eligible", "Sıranız stok içinde değil.");

    const code = genCode();

    const updated = await R.markClaimedIfNot(tx, me.id, code);
    if (updated.count === 0) {
      // Yarış: tekrar oku, idempotent yanıt ver
      const again = await R.getWaitlistEntry(tx, userId, dropId);
      if (again?.claimed && again.claimCode) {
        return { status: "already_claimed" as const, claimCode: again.claimCode };
      }
      throw new AppError(409, "race_conflict", "Yarış durumu, tekrar deneyin.");
    }

    return { status: "claimed" as const, claimCode: code };
  });
}
