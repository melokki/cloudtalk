export const indexProductSchema = {
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
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "string" },
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
export * from "./show.js";
