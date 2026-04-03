import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../config/prisma";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const generateLeadId = async (): Promise<string> => {
  const count = await prisma.lead
    .findMany({
      where: {
        isDeleted: false,
      },
    })
    .then((res) => res.length);
  const next = count + 1;
  return `LID-${String(next).padStart(4, "0")}`;
};

export const generateDocumentNumber = (
  prefix: string,
  counter: number
): string => {
  return `${prefix}-${String(counter).padStart(4, "0")}`;
};

export async function generateNextDocNumber(
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  prefix: string,
  field: "leadNumber" | "poNumber" | "doNumber"
) {
  const whereCondition =
    field === "leadNumber" ? {} : { [field]: { not: null } };

  const last = await tx.lead.findFirst({
    where: whereCondition,
    orderBy: { [field]: "desc" },
    select: { [field]: true },
  });

  console.log("last =>", last);

  const lastNumber = last?.[field]
    ? parseInt(last[field]!.toString().replace(`${prefix}-`, ""), 10)
    : 0;

  return `${prefix}-${String(lastNumber + 1).padStart(4, "0")}`;
}
