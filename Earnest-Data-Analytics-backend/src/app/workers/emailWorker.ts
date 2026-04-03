import { Worker } from "bullmq";
import { connection } from "../config/redisClient";
import { mailerService } from "../modules/mailer";

const worker = new Worker(
  "email-queue",
  async (job) => {
    const { to, name, employeeId, password } = job.data;
    console.log("Processing job:", job.name);
    await mailerService.sendNewUserNotification(to, {
      name,
      employeeId,
      password,
    });
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
