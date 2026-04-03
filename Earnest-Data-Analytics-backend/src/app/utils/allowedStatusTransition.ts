import { BillingStatus, Status } from "@prisma/client";

export const allowedStatusTransition: Record<Status, Status[]> = {
  RECEIVED: ["RECEIVED", "INPROGRESS", "CANCELED"],
  INPROGRESS: ["INPROGRESS", "COMPLETED", "CANCELED"],
  COMPLETED: ["COMPLETED", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELED: [],
};

export const allowedBillingStatusTransition: Record<
  "ADMIN" | "EMPLOYEE", // assume you have a UserRole enum or union like "ADMIN" | "EMPLOYEE"
  Record<keyof typeof BillingStatus, Array<keyof typeof BillingStatus>>
> = {
  ADMIN: {
    NONE: ["NONE", "PAID", "PARTIALLY_PAID", "CANCELED"],
    REQUESTED: ["REQUESTED", "PAID", "PARTIALLY_PAID", "CANCELED"],
    PAID: ["PAID"],
    PARTIALLY_PAID: ["PARTIALLY_PAID", "PAID", "CANCELED"],
    CANCELED: ["CANCELED"],
  },
  EMPLOYEE: {
    NONE: ["NONE", "REQUESTED"],
    REQUESTED: ["REQUESTED"], // employee cannot move forward once requested
    PAID: ["PAID"],
    PARTIALLY_PAID: ["PARTIALLY_PAID"],
    CANCELED: ["CANCELED"],
  },
};