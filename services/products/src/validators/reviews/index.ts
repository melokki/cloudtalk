export const indexProductReviewsSchema = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                reviewText: { type: "string" },
                rating: { type: "string" },
              },
            },
          },
          nextCursor: { type: "string" },
        },
      },
    },
  },
};

export * from "./destroy.js";
export * from "./store.js";
export * from "./update.js";
