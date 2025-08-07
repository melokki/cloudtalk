import { reviewQueue } from "../queue/reviewQueue.js";

interface ReviewEvent {
  type: "review.created" | "review.updated" | "review.deleted";
  productId: string;
  reviewId: string;
  rating?: number;
  oldRating?: number;
  timestamp: string;
}

export class EventPublisher {
  static async publishReviewEvent(event: ReviewEvent): Promise<void> {
    try {
      const job = await reviewQueue.add("process-review", event, {
        // Optional: Add job-specific options
        priority: event.type === "review.created" ? 10 : 5,
      });

      console.log(
        `📤 Published ${event.type} event for product ${event.productId} (Job ID: ${job.id})`,
      );
    } catch (error) {
      console.error("Failed to publish review event:", error);
      throw error;
    }
  }
}
