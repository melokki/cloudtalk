import type { FastifyServerOptions } from "fastify";
import type { PrismaClient } from "@database/client.js";
import type { AutoloadPluginOptions } from "@fastify/autoload";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}

declare module "fastify" {
  interface FastifyInstance {}
}

declare module "@fastify/awilix" {
  interface Cradle {
    prismaClient: PrismaClient;
  }
  interface RequestCradle {}
}
