export type UpdateReviewRequest = {
  Params: {
    productId: string;
    id: string;
  };
  Body: {
    firstName: string;
    lastName: string;
    reviewText: string;
    rating: number;
  };
};
