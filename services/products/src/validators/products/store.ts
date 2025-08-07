export const storeProductSchema = {
  schema: {
    body: {
      type: "object",
      required: ["name", "description", "price"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        price: { type: "integer" },
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
