import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { builtinModules } from "module";
import { glob } from "glob";

export default {
  input: Object.fromEntries(
    glob
      .sync("src/**/*.ts", {
        ignore: ["src/types/**/*.ts"],
      })
      .map((file) => [file.slice(4, -3), file]),
  ),
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  external: (id, parentId, isResolved) => {
    if (builtinModules.includes(id)) {
      return true;
    }
    if (id.startsWith("node:")) {
      return true;
    }

    if (id === "fastify" || id.startsWith("fastify/")) {
      return true;
    }
    if (id.startsWith("@fastify/")) {
      return true;
    }

    if (id === "pino" || id.startsWith("pino/") || id.startsWith("pino-")) {
      return true;
    }
    if (id === "sonic-boom" || id.startsWith("sonic-boom/")) {
      return true;
    }
    if (id === "thread-stream" || id.startsWith("thread-stream/")) {
      return true;
    }

    const problematicModules = [
      "real-require",
      "events",
      "ajv",
      "ajv-formats",
      "fast-json-stringify",
      "find-my-way",
      "secure-json-parse",
      "on-exit-leak-free",
      "atomic-sleep",
      "process-warning",
      "fast-redact",
      "quick-format-unescaped",
      "split2",
      "end-of-stream",
      "pump",
    ];

    for (const mod of problematicModules) {
      if (id === mod || id.startsWith(`${mod}/`)) {
        return true;
      }
    }

    if (id.includes("node_modules")) {
      return true;
    }

    return false;
  },

  plugins: [
    json({
      compact: true,
    }),

    resolve({
      preferBuiltins: true,
      exportConditions: ["node"],
      browser: false,
      skip: [
        "fastify",
        "pino",
        "sonic-boom",
        "thread-stream",
        /^@fastify\/.*/,
        /^pino.*/,
      ],
    }),

    commonjs({
      include: /node_modules/,
      exclude: [
        "**/fastify/**",
        "**/pino/**",
        "**/sonic-boom/**",
        "**/thread-stream/**",
        "**/@fastify/**",
        "**/*.json",
      ],
      requireReturnsDefault: "auto",
      esmExternals: true,
    }),

    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],

  onwarn(warning, warn) {
    // Skip these warnings
    if (warning.code === "THIS_IS_UNDEFINED") return;
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    if (warning.code === "UNRESOLVED_IMPORT") return;
    if (warning.code === "MISSING_EXPORT") return;

    warn(warning);
  },
};
