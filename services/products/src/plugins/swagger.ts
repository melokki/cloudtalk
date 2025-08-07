import fastifySwagger, { type FastifySwaggerOptions } from "@fastify/swagger";
import fp from "fastify-plugin";

export default fp<FastifySwaggerOptions>(async (fastify) => {
  fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Test swagger",
        description: "Testing the Fastify swagger API",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],

      components: {},
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
    },
  });
});
