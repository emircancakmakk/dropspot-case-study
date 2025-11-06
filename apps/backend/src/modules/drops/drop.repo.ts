import { Prisma } from "@prisma/client";
import { prisma } from "../../plugins/prisma";
import { CreateDropInput, UpdateDropInput } from "./drops.schema";

export function findActiveDrops() {
  return prisma.drop.findMany({
    where: {
      isActive: true,
    },
  });
}

export function insertDrop(input: CreateDropInput) {
  return prisma.drop.create({
    data: input,
  });
}

export function updateDropById(id: string, input: UpdateDropInput) {
  return prisma.drop.update({
    where: {
      id: id,
    },
    data: input,
  });
}

export function findDropById(id: string) {
  return prisma.drop.findUnique({
    where: {
      id: id,
    },
  });
}

export function deleteDropById(id: string) {
  return prisma.drop.delete({
    where: {
      id: id,
    },
  });
}

export function isDropActive(dropId: string) {
  return prisma.drop.findUnique({
    where: { id: dropId },
    select: { isActive: true },
  });
}

export async function upsertWaitlist(input: {
  userId: string;
  dropId: string;
  priorityScore: number;
}) {
  const { userId, dropId, priorityScore } = input;

  return prisma.waitlist.upsert({
    where: { userId_dropId: { userId, dropId } },
    update: {}, // idempotent
    create: { userId, dropId, priorityScore },
    select: {
      id: true,
      userId: true,
      dropId: true,
      priorityScore: true,
      joinedAt: true,
      claimed: true,
    },
  });
}

export function deleteWaitlistEntry(userId: string, dropId: string) {
  return prisma.waitlist.deleteMany({
    where: {
      userId,
      dropId,
    },
  });
}

export function getWaitlistClaimState(userId: string, dropId: string) {
  return prisma.waitlist.findUnique({
    where: { userId_dropId: { userId, dropId } },
    select: { claimed: true },
  });
}

export function getDropForClaim(tx: Prisma.TransactionClient, dropId: string) {
  return tx.drop.findUnique({
    where: { id: dropId },
    select: {
      id: true,
      isActive: true,
      claimStart: true,
      claimEnd: true,
      stock: true,
    },
  });
}

export function getWaitlistEntry(
  tx: Prisma.TransactionClient,
  userId: string,
  dropId: string
) {
  return tx.waitlist.findUnique({
    where: { userId_dropId: { userId, dropId } },
    select: {
      id: true,
      joinedAt: true,
      priorityScore: true,
      claimed: true,
      claimCode: true,
    },
  });
}

// Sıradan önce kaç kişi var? priorityScore DESC, eşitlikte joinedAt ASC
export function countBeforeMe(
  tx: Prisma.TransactionClient,
  dropId: string,
  myScore: number,
  myJoinedAt: Date
) {
  return tx.waitlist.count({
    where: {
      dropId,
      OR: [
        { priorityScore: { gt: myScore } },
        { AND: [{ priorityScore: myScore }, { joinedAt: { lt: myJoinedAt } }] },
      ],
    },
  });
}

export function countClaimed(tx: Prisma.TransactionClient, dropId: string) {
  return tx.waitlist.count({ where: { dropId, claimed: true } });
}

// Yarış güvenliği: yalnızca claimed=false satırı güncellensin
export function markClaimedIfNot(
  tx: Prisma.TransactionClient,
  waitlistId: string,
  code: string
) {
  return tx.waitlist.updateMany({
    where: { id: waitlistId, claimed: false },
    data: { claimed: true, claimAt: new Date(), claimCode: code },
  });
}

export function findAllDrops() {
  return prisma.drop.findMany();
}

export async function isUserInWaitlist(dropId: string, userId: string) {
  const exists = await prisma.waitlist.findFirst({
    where: { dropId, userId },
    select: { id: true },
  });
  return Boolean(exists);
}

export async function hasUserClaimed(dropId: string, userId: string) {
  const entry = await prisma.waitlist.findUnique({
    where: { userId_dropId: { userId, dropId } },
    select: { claimed: true },
  });
  return entry?.claimed ?? false;
}