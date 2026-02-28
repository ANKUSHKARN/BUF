import prisma from "../config/prisma";
import {
  generateUnpaidMonths,
  calculateRollingAmounts,
} from "../utils/rollingPenaltyCalculator";
import {
  uploadFilesToCloudinary,
  deleteFileFromCloudinary,
} from "./upload.service";

/**
 * Create Contribution
 */
export const createContribution = async (
  userId: string,
  files: Express.Multer.File[]
) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  /**
   * Prevent multiple pending submission
   */
  const existingPending = await prisma.contribution.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
  });

  if (existingPending) {
    throw new Error(
      "You already have a pending contribution request"
    );
  }

  /**
   * Generate unpaid months
   */
  const unpaidMonths = await generateUnpaidMonths(
    prisma,
    user,
    currentMonth
  );

  if (unpaidMonths.length === 0) {
    throw new Error("No unpaid months found");
  }

  /**
   * Prevent duplicates
   */
  for (const month of unpaidMonths) {
    const existing = await prisma.contribution.findFirst({
      where: { userId, month },
    });

    if (existing) {
      throw new Error(
        `Contribution already exists for ${month}`
      );
    }
  }

  /**
   * Calculate amounts
   */
  const { breakdown, waiverUsedCount } =
    calculateRollingAmounts(
      user.monthlyContribution,
      unpaidMonths,
      user.waiverRemaining
    );

  let uploadedFiles: {
    fileUrl: string;
    filePublicId: string;
  }[] = [];

  try {
    /**
     * 1️⃣ Upload files first
     */
    uploadedFiles = await uploadFilesToCloudinary(
      files,
      `buf/contributions/${userId}`
    );

    /**
     * 2️⃣ Transaction
     */
    await prisma.$transaction(async (tx) => {
      for (const entry of breakdown) {
        const contribution = await tx.contribution.create({
          data: {
            userId,
            month: entry.month,
            baseAmount: entry.baseAmount,
            penaltyAmount: entry.penaltyAmount,
            totalPaid: entry.totalPaid,
            waiverUsed: waiverUsedCount > 0,
            status: "PENDING",
          },
        });

        await tx.contributionProof.createMany({
          data: uploadedFiles.map((file) => ({
            contributionId: contribution.id,
            fileUrl: file.fileUrl,
            filePublicId: file.filePublicId,
          })),
        });
      }

      if (waiverUsedCount > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            waiverRemaining: {
              decrement: waiverUsedCount,
            },
          },
        });
      }
    });

    return {
      message: "Contribution submitted successfully",
      monthsCreated: breakdown.length,
      waiverUsedCount,
    };
  } catch (error) {
    /**
     * 3️⃣ Cleanup if DB fails
     */
    if (uploadedFiles.length > 0) {
      await Promise.all(
        uploadedFiles.map((file) =>
          deleteFileFromCloudinary(file.filePublicId)
        )
      );
    }

    throw error;
  }
};

/**
 * Preview Contribution
 */
export const getMyContributionPreview = async (
  userId: string
) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const unpaidMonths = await generateUnpaidMonths(
    prisma,
    user,
    currentMonth
  );

  if (unpaidMonths.length === 0) {
    return {
      message: "No outstanding contributions",
      months: [],
      totalBase: 0,
      totalPenalty: 0,
      totalPayable: 0,
      waiverWillBeUsed: 0,
    };
  }

  const { breakdown, waiverUsedCount } =
    calculateRollingAmounts(
      user.monthlyContribution,
      unpaidMonths,
      user.waiverRemaining
    );

  const totalBase = breakdown.reduce(
    (sum, m) => sum + m.baseAmount,
    0
  );

  const totalPenalty = breakdown.reduce(
    (sum, m) => sum + m.penaltyAmount,
    0
  );

  return {
    months: breakdown,
    totalBase,
    totalPenalty,
    totalPayable: totalBase + totalPenalty,
    waiverWillBeUsed: waiverUsedCount,
  };
};

/**
 * My Contribution History
 */
export const getMyContributionHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  const skip = (page - 1) * limit;

  const whereClause: any = { userId };

  if (status) {
    whereClause.status = status;
  }

  const [contributions, total] = await Promise.all([
    prisma.contribution.findMany({
      where: whereClause,
      include: {
        proofs: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contribution.count({
      where: whereClause,
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: contributions,
  };
};


/**
 * Get total contribution of a user
 */
export const getMyTotalContribution = async (userId: string) => {
  const grouped = await prisma.contribution.groupBy({
    by: ["status"],
    where: {
      userId,
    },
    _sum: {
      totalPaid: true,
    },
  });

  let approved = 0;
  let pending = 0;

  for (const item of grouped) {
    if (item.status === "APPROVED") {
      approved = item._sum.totalPaid || 0;
    }

    if (item.status === "PENDING") {
      pending = item._sum.totalPaid || 0;
    }
  }

  return {
    totalContribution: approved + pending,
    approvedContribution: approved,
    pendingContribution: pending,
  };
};

/** summary stats*/
export const getDashboardSummary = async () => {
  const [
    approvedAggregate,
    pendingAggregate,
    approvedCount,
    totalUsers,
    employedCount,
    unemployedCount,
    // emergencyFund,
  ] = await Promise.all([
    // Total corpus (approved contributions)
    prisma.contribution.aggregate({
      where: { status: "APPROVED" },
      _sum: { totalPaid: true },
    }),

    // Total pending amount
    prisma.contribution.aggregate({
      where: { status: "PENDING" },
      _sum: { totalPaid: true },
    }),

    // Total approved contribution records
    prisma.contribution.count({
      where: { status: "APPROVED" },
    }),

    // Total brothers
    prisma.user.count(),

    // Employed brothers
    prisma.user.count({
      where: { employmentStatus: "EMPLOYED" },
    }),

    // Unemployed brothers
    prisma.user.count({
      where: { employmentStatus: "UNEMPLOYED" },
    }),

    // Emergency reserve fund (assuming single record system)
    // prisma.emergencyFund.findFirst({
    //   orderBy: { createdAt: "desc" },
    // }),
  ]);

  return {
    totalCorpus: approvedAggregate._sum.totalPaid || 0,
    totalApprovedCount: approvedCount,
    totalPendingAmount: pendingAggregate._sum.totalPaid || 0,
    totalBrothers: totalUsers,
    employedBrothers: employedCount,
    unemployedBrothers: unemployedCount,
    // emergencyReserveFund: emergencyFund?.amount || 0,
  };
};