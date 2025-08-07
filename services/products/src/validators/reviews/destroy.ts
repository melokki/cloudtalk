export const destroyProductReviewSchema = {
  schema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
      404: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
