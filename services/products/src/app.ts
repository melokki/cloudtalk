import AutoLoad from "@fastify/autoload";
import { fastifyEnv } from "@fastify/env";
import Fastify from "fastify";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppOptions } from "@app-types/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: AppOptions = {
  ignoreDuplicateSlashes: true,
  logger: {
    level: process.env.ENV_LEVEL || "debug",
    redact: ["headers.authorization"],
  },
};

const startServer = async () => {
  const app = Fastify(options);

  app.register(fastifyEnv, {
    dotenv: {
      path: "./../../.env",
    },
    schema: {
      type: "object",
      required: ["DATABASE_URL"],
      properties: {
        DATABASE_URL: {
          type: "string",
        },
      },
    },
  });

  app.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options,
  });

  app.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options,
  });

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await app.close();
        app.log.error(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        app.log.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  try {
    await app.listen({
      host: "0.0.0.0",
      port: 3000,
    });
    await app.ready();

    if (process.env.NODE_ENV !== "production") {
      app.swagger();
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
