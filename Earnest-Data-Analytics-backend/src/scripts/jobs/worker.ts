import prisma from "../../app/config/prisma";
import { mailerService } from "../../app/modules/mailer";

const MAX_ATTEMPTS = 3;

export async function processJob() {
  const job = await prisma.job.findFirst({
    where: {
      status: "PENDING",
      lockedAt: null,
      OR: [
        { retryAfter: null },
        { retryAfter: { lte: new Date() } }, // retry if delay passed
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!job) return;

  // Try to atomically lock the job when it's not locked
  const locked = await prisma.job.updateMany({
    where: {
      id: job.id,
      lockedAt: null,
    },
    data: {
      lockedAt: new Date(),
      status: "PROCESSING",
    },
  });

  if (locked.count === 0) return; // another process took it

  try {
    // Dispatch job by type
    if (job.type === "SEND_NEW_USER_EMAIL") {
      const { to, name, employeeId, password } = job.payload as unknown as {
        to: string;
        name: string;
        employeeId: string;
        password: string;
      };
      await mailerService.sendNewUserNotification(to, {
        name,
        employeeId,
        password,
      });
    }

    // Success: mark as completed
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
      },
    });
  } catch (error: any) {
    const currentAttempt = job.attempts + 1;
    const isLastAttempt = currentAttempt >= MAX_ATTEMPTS;

    // Calculate progressive backoff delay (10s, 20s, 30s)
    const retryAfter = new Date(Date.now() + currentAttempt * 10 * 1000);

    if (isLastAttempt) {
      // Move to failed jobs table
      await prisma.failedJob.create({
        data: {
          jobId: job.id,
          reason: error.message || "Unknown error",
          payload: job.payload as unknown as string,
        },
      });
    }

    // Update job for retry or failure
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: isLastAttempt ? "FAILED" : "PENDING",
        attempts: { increment: 1 },
        retryAfter: isLastAttempt ? null : retryAfter,
        lockedAt: null, // unlock for next run
      },
    });

    console.error(
      `[Job ${job.id}] Failed on attempt ${currentAttempt}: ${error.message}`
    );
  }
}

setInterval(() => {
  processJob().catch((err) => console.error("Job error", err));
}, 5000); // every 5 seconds
