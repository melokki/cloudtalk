import type { Redis } from "ioredis";
import { PrismaClient } from "@database/client.js";
import { RatingCalculator } from "@processors/rating-calculator.processor.js";
import type { ReviewEvent } from "src/@types/event.js";
import { logger } from "@config/logger.js";
import { formatError } from "@utils/error.js";

export class ReviewEventProcessor {
  private ratingCalculator: RatingCalculator;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
  ) {
    this.ratingCalculator = new RatingCalculator(this.prisma, this.redis);
  }

  async processEvent(event: ReviewEvent): Promise<void> {
    logger.info(
      {
        eventType: event.type,
        productId: event.productId,
        reviewId: event.reviewId,
        rating: event.rating,
      },
      "📝 Processing review event",
    );

    try {
      switch (event.type) {
        case "review.created":
          await this.handleReviewCreated(event);
          break;
        case "review.updated":
          await this.handleReviewUpdated(event);
          break;
        case "review.deleted":
          await this.handleReviewDeleted(event);
          break;
        default:
          throw new Error(`Unknown event type: ${(event as any).type}`);
      }
    } catch (error) {
      const { message, stack } = formatError(error);
      logger.error(
        {
          error: message,
          stack,
          eventType: event.type,
          productId: event.productId,
          reviewId: event.reviewId,
        },
        "Failed to process review event",
      );

      throw error;
    }
  }

  private async handleReviewCreated(event: ReviewEvent): Promise<void> {
    logger.debug(
      {
        productId: event.productId,
        reviewId: event.reviewId,
        rating: event.rating,
      },
      "Handling review creation",
    );
    await this.ratingCalculator.calculateAndStoreRating(event.productId);
  }

  private async handleReviewUpdated(event: ReviewEvent): Promise<void> {
    logger.debug(
      {
        productId: event.productId,
        reviewId: event.reviewId,
        oldRating: event.oldRating,
        newRating: event.rating,
      },
      "Handling review update",
    );
    await this.ratingCalculator.calculateAndStoreRating(event.productId);
  }

  private async handleReviewDeleted(event: ReviewEvent): Promise<void> {
    logger.debug(
      {
        productId: event.productId,
        reviewId: event.reviewId,
        rating: event.rating,
      },
      "Handling review deletion",
    );
    await this.ratingCalculator.calculateAndStoreRating(event.productId);
  }
}
