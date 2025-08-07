import {
  type FastifyAwilixOptions,
  fastifyAwilixPlugin,
} from "@fastify/awilix";
import { InjectionMode } from "awilix";
import { asClass } from "awilix";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as fs from "fs";
import { fileURLToPath } from "node:url";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ServiceConstructor = new () => any;

async function registerServices(fastify: FastifyInstance) {
  const servicesDir = path.join(__dirname, "../services");
  const registrations: Record<string, any> = {};

  for (const file of fs.readdirSync(servicesDir)) {
    if (file.startsWith("base") || !file.endsWith(".service.ts")) continue;

    const modulePath = path.join(servicesDir, file);
    const serviceModule = await import(modulePath);

    const serviceClass = Object.values(serviceModule).find(
      (value) => typeof value === "function",
    ) as ServiceConstructor | undefined;

    if (serviceClass) {
      const serviceName = `${serviceClass.name.charAt(0).toLowerCase()}${serviceClass.name.slice(1)}`;
      registrations[serviceName] = asClass(serviceClass).singleton();
    }

    fastify.diContainer.register(registrations);
  }
}

export default fp<FastifyAwilixOptions>(
  async (fastify) => {
    await fastify.register(fastifyAwilixPlugin, {
      strictBooleanEnforced: true,
      injectionMode: InjectionMode.PROXY,
    });
    await registerServices(fastify);
  },
  { name: "services" },
);
