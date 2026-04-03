import { Role } from "@prisma/client";
import prisma from "../config/prisma";

export const generateEmployeeId = async (): Promise<string> => {
  const count = await prisma.user
    .findMany({
      where: {
        role: Role.EMPLOYEE,
      },
    })
    .then((res) => res.length);
  const next = count + 1;
  return `EID-${String(next).padStart(4, "0")}`;
};
