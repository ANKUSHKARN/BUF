import prisma from "../config/prisma";

/**
 * Get all contributions (latest first)
 */
export const getAllContributions = async () => {
  const contributions = await prisma.contribution.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return contributions;
};

/**
 * Approve Contribution
 */
export const approveContribution = async (contributionId: string) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) {
    throw new Error("Contribution not found");
  }

  if (contribution.status === "APPROVED") {
    throw new Error("Contribution already approved. Cannot modify.");
  }

  await prisma.contribution.update({
    where: { id: contributionId },
    data: {
      status: "APPROVED",
    },
  });

  return { message: "Contribution approved successfully" };
};

/**
 * Reject Contribution
 */
export const rejectContribution = async (contributionId: string) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) {
    throw new Error("Contribution not found");
  }

  if (contribution.status === "APPROVED") {
    throw new Error("Approved contribution cannot be rejected.");
  }

  await prisma.contribution.update({
    where: { id: contributionId },
    data: {
      status: "REJECTED",
    },
  });

  return { message: "Contribution rejected successfully" };
};

/**
 * Delete Contribution (Only if PENDING)
 */
export const deleteContribution = async (contributionId: string) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) {
    throw new Error("Contribution not found");
  }

  if (contribution.status === "APPROVED") {
    throw new Error("Approved contribution cannot be deleted.");
  }

  if (contribution.status === "REJECTED") {
    throw new Error("Rejected contribution cannot be deleted.");
  }

  await prisma.contribution.delete({
    where: { id: contributionId },
  });

  return { message: "Contribution deleted successfully" };
};