//I am not implementing logs for now, will do it in next phase. Just created this util
import prisma from "../config/prisma";

interface AuditLogParams {
  userId?: string;
  actionType: string;
  referenceId?: string;
  amount?: number;
  metadata?: any;
}

export const logAudit = async ({
  userId,
  actionType,
  referenceId,
  amount,
  metadata,
}: AuditLogParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        actionType,
        referenceId,
        amount,
        metadata,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};
