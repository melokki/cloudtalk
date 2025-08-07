export const updateProductReviewSchema = {
  schema: {
    body: {
      type: "object",
      properties: {
        firstNme: { type: "string" },
        lastName: { type: "string" },
        reviewText: { type: "string" },
        rating: { type: "integer", minimum: 1, maximum: 5 },
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
