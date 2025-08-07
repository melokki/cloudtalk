import { Worker, type ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
import { PrismaClient } from "@database/client.js";
import { ReviewEventProcessor } from "@processors/review-event.processor.js";
import { logger } from "@config/logger.js";
import { formatError } from "@utils/error.js";
import type { JobData } from "./@types/event.js";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = 6379;
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "5");
const QUEUE_NAME = "review-processing";

const prisma = new PrismaClient();
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const connection: ConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

const processor = new ReviewEventProcessor(prisma, redis);
const worker = new Worker<JobData>(
  QUEUE_NAME,
  async (job) => {
    const startTime = Date.now();
    logger.info(
      {
        jobId: job.id,
        eventType: job.data.type,
        productId: job.data.productId,
      },
      "🚀 Starting job processing",
    );

    try {
      await processor.processEvent(job.data);

      const duration = Date.now() - startTime;
      logger.info(
        {
          jobId: job.id,
          duration,
          eventType: job.data.type,
          productId: job.data.productId,
        },
        "✅ Job completed",
      );
    } catch (error) {
      const { message, stack } = formatError(error);
      logger.error(
        {
          jobId: job.id,
          error: message,
          stack,
          eventType: job.data.type,
          productId: job.data.productId,
        },
        "Job processing failed",
      );
      throw error;
    }
  },
  {
    connection,
    concurrency: WORKER_CONCURRENCY,
  },
);

worker.on("ready", () => {
  logger.info(
    {
      queueName: QUEUE_NAME,
      concurrency: WORKER_CONCURRENCY,
      redisHost: REDIS_HOST,
      redisPort: REDIS_PORT,
    },
    "🎯 Worker ready and listening to queue",
  );
});

worker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
      eventType: job.data?.type,
      productId: job.data?.productId,
    },
    "✅ Job completed successfully",
  );
});

worker.on("failed", (job, err) => {
  logger.error(
    { error: err.message, stack: err.stack },
    "🚨 Worker error occurred",
  );
});

worker.on("error", (err) => {
  logger.error(
    { error: err.message, stack: err.stack },
    "🚨 Worker error occurred",
  );
});

worker.on("stalled", (jobId) => {
  logger.warn({ jobId }, "⚠️ Job stalled");
});

const shutdown = async (signal: string) => {
  logger.info(
    { signal },
    "\n🛑 Received shutdown signal, shutting down gracefully",
  );

  try {
    logger.info('("🔄 Closing worker...');
    await worker.close();

    logger.info("🔌 Disconnecting from database...");
    await prisma.$disconnect();

    logger.info('("✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    const { message, stack } = formatError(error);
    logger.error({ error: message, stack }, "❌ Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

logger.info("🎬 Review Processing Service starting...");
