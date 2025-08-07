import { PrismaClient } from "@database/client.js";
import { logger } from "@config/logger.js";
import { formatError } from "@utils/error.js";
import type { Redis } from "ioredis";

export class RatingCalculator {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
  ) {}

  async calculateAndStoreRating(productId: string): Promise<void> {
    logger.debug({ productId }, "Calculating average rating");

    try {
      const reviews = await this.prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          : 0;

      const roundedRating = Math.round(averageRating * 100) / 100;

      await this.prisma.productRating.create({
        data: {
          productId,
          averageRating: roundedRating,
          reviewCount,
        },
      });

      this.redis.setex(
        `rating:${productId}`,
        300,
        JSON.stringify({
          averageRating: roundedRating,
        }),
      );

      logger.info(
        {
          productId,
          averageRating: roundedRating,
          reviewCount,
          previousCount: reviews.length,
        },
        "✓  Rating calculation completed",
      );
    } catch (error) {
      const { message, stack } = formatError(error);
      logger.error(
        {
          error: message,
          stack,
          productId,
        },
        "Failed to calculate and store rating",
      );

      throw error;
    }
  }
}
