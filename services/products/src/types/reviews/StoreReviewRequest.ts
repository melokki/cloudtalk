export type StoreReviewRequest = {
  Params: {
    productId: string;
  };
  Body: {
    firstName: string;
    lastName: string;
    reviewText: string;
    rating: number;
  };
};
