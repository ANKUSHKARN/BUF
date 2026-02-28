import prisma from "../config/prisma";
import bcrypt from "bcrypt";

//create brother
export const createBrother = async (data: {
  name: string;
  email: string;
  password: string;
  mobile: string;
  employmentStatus: "EMPLOYED" | "UNEMPLOYED";
  monthlyContribution: number;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "BROTHER",
      mobile: data.mobile,
      employmentStatus: data.employmentStatus,
      monthlyContribution: data.monthlyContribution,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      monthlyContribution: true,
      employmentStatus: true,
      waiverRemaining: true,
      isActive: true,
      joinDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


//get all brothers
export const getAllBrothers = async () => {
  return prisma.user.findMany({
    where: {
      role: "BROTHER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      employmentStatus: true,
      monthlyContribution: true,
      waiverRemaining: true,
      isActive: true,
      joinDate: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};