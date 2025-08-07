export type ReviewEvent = {
  type: "review.created" | "review.updated" | "review.deleted";
  productId: string;
  reviewId: string;
  rating?: number;
  oldRating?: number;
  timestamp: string;
};

export type JobData = ReviewEvent & {
  attemptCount?: number;
};
