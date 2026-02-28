export const generateUnpaidMonths = async (
  prisma: any,
  user: any,
  targetMonth: string
) => {
  const [targetYear, targetMonthNum] = targetMonth.split("-").map(Number);
  const targetDate = new Date(targetYear, targetMonthNum - 1);

  const joinDate = new Date(user.joinDate);
  const iterator = new Date(joinDate.getFullYear(), joinDate.getMonth());

  const unpaidMonths: string[] = [];

  while (iterator <= targetDate) {
    const monthStr = `${iterator.getFullYear()}-${String(
      iterator.getMonth() + 1
    ).padStart(2, "0")}`;

    const existing = await prisma.contribution.findFirst({
      where: {
        userId: user.id,
        month: monthStr,
        status: "APPROVED",
      },
    });

    if (!existing) {
      unpaidMonths.push(monthStr);
    }

    iterator.setMonth(iterator.getMonth() + 1);
  }

  unpaidMonths.sort(); // oldest first

  return unpaidMonths;
};

export const calculateRollingAmounts = (
  monthlyContribution: number,
  unpaidMonths: string[],
  waiverRemaining: number
) => {
  const totalMonths = unpaidMonths.length;

  const breakdown: {
    month: string;
    baseAmount: number;
    penaltyAmount: number;
    totalPaid: number;
  }[] = [];

  let totalPenaltyMonths = totalMonths - 1; 
  // Last (current) month has 0 penalty

  let waiversToUse = Math.min(
    waiverRemaining,
    totalPenaltyMonths
  );

  for (let i = 0; i < totalMonths; i++) {
    let penalty =
      (totalMonths - i - 1) * 100;

    // Apply waiver to lowest penalties first
    if (penalty > 0 && waiversToUse > 0) {
      penalty -= 100;
      waiversToUse--;
    }

    breakdown.push({
      month: unpaidMonths[i],
      baseAmount: monthlyContribution,
      penaltyAmount: penalty,
      totalPaid: monthlyContribution + penalty,
    });
  }

  const waiverUsed =
    Math.min(waiverRemaining, totalPenaltyMonths);

  return {
    breakdown,
    waiverUsedCount: waiverUsed,
  };
};