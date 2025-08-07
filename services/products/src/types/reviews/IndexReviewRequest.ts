export type IndexReviewRequest = {
  Params: {
    productId: string;
  };
  Querystring: {
    limit?: number;
    cursor?: string;
  };
};
