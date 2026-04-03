import { jobScheduler } from "../../app/jobs";

async function main() {
  console.log("Starting job processor...");

  try {
    await jobScheduler.start();
  } catch (error) {
    console.error("Failed to start job processor:", error);
    process.exit(1);
  }
}

// Start the job processor
main().catch(console.error);
