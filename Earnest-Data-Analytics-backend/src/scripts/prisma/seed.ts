// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import config from "../../app/config";

const prisma = new PrismaClient();

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ahlanprintworks.com";
  const ADMIN_ID = process.env.ADMIN_ID || "AID-0001";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const EMPLOYEE_EMAIL =
    process.env.EMPLOYEE_EMAIL || "employee@ahlanprintworks.com";
  const EMPLOYEE_ID = process.env.EMPLOYEE_ID || "EID-0001";
  const EMPLOYEE_PASSWORD = process.env.EMPLOYEE_PASSWORD || "employee123";

  const adminPasswordHash = await bcrypt.hash(
    ADMIN_PASSWORD,
    config.bcrypt_salt_round
  );

  const employeePasswordHash = await bcrypt.hash(
    EMPLOYEE_PASSWORD,
    config.bcrypt_salt_round
  );

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      employeeId: ADMIN_ID,
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      name: "Administrator",
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin ready: ${admin.email} (${admin.id})`);
  const employee = await prisma.user.upsert({
    where: { email: EMPLOYEE_EMAIL },
    update: {},
    create: {
      employeeId: EMPLOYEE_ID,
      email: EMPLOYEE_EMAIL,
      password: employeePasswordHash,
      name: "Employee",
      role: Role.EMPLOYEE,
    },
  });

  console.log(`✅ Employee ready: ${employee.email} (${employee.id})`);

  const meterUom = await prisma.uom.upsert({
    where: { name: "Meter" },
    update: {},
    create: {
      name: "Meter",
      abbreviation: "m",
    },
  });
  console.log(`✅ UOM ready: ${meterUom.name}`);

  const dtfPrintType = await prisma.printType.upsert({
    where: { name: "DTF" },
    update: {},
    create: {
      name: "DTF",
    },
  });
  console.log(`✅ PrintType ready: ${dtfPrintType.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
