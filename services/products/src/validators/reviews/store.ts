export const storeProductReviewSchema = {
  schema: {
    body: {
      type: "object",
      required: ["firstName", "lastName", "reviewText", "rating"],
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
      409: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
