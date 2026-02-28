import prisma from "../config/prisma";

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      monthlyContribution: true,
      waiverRemaining: true,
      isActive: true,
      joinDate: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * Get Brother Full Details
 */
export const getBrotherById = async (userId: string) => {
  const brother = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contributions: {
        orderBy: { createdAt: "desc" },
      },
      loans: {
        orderBy: { createdAt: "desc" },
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
      },
      investments: {
        orderBy: { createdAt: "desc" },
      },
      votes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!brother) {
    throw new Error("Brother not found");
  }

  if (brother.role !== "BROTHER") {
    throw new Error("User is not a brother");
  }

  const totalContribution = brother.contributions
    .filter(c => c.status === "APPROVED")
    .reduce((sum, c) => sum + c.totalPaid, 0);

  const totalLoans = brother.loans
    .reduce((sum, l) => sum + l.principalAmount, 0);

  const totalWithdrawals = brother.withdrawals
    .reduce((sum, w) => sum + w.amount, 0);

  const totalInvestments = brother.investments
    .reduce((sum, i) => sum + i.amountTaken, 0);

  return {
    basicInfo: {
      id: brother.id,
      name: brother.name,
      email: brother.email,
      isActive: brother.isActive,
      monthlyContribution: brother.monthlyContribution,
      waiverRemaining: brother.waiverRemaining,
      createdAt: brother.createdAt,
    },
    summary: {
      totalContribution,
      totalLoans,
      totalWithdrawals,
      totalInvestments,
    },
    contributions: brother.contributions,
    loans: brother.loans,
    withdrawals: brother.withdrawals,
    investments: brother.investments,
    votes: brother.votes,
  };
};

/**
 * Activate Brother
 */
export const activateBrother = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "BROTHER") {
    throw new Error("Only brothers can be activated/deactivated");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  return { message: "Brother activated successfully" };
};

/**
 * Deactivate Brother
 */
export const deactivateBrother = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "BROTHER") {
    throw new Error("Only brothers can be activated/deactivated");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return { message: "Brother deactivated successfully" };
};