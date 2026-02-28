import prisma from "../config/prisma";
import bcrypt from "bcrypt";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Head Brother",
      email: "admin@buf.com",
      password: hashedPassword,
      mobile: "9999999999",
      role: "ADMIN",
      monthlyContribution: 0,
      employmentStatus: "EMPLOYED"
    }
  });

  console.log("Admin created");
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


// use this to create admin - npx ts-node src/utils/createAdmin.ts