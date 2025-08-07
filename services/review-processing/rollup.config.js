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
        ignore: ["src/@types/**/*.ts"],
      })
      .map((file) => [file.slice(4, -3), file]),
  ),
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
  },
  external: (id, parentId, isResolved) => {
    if (builtinModules.includes(id)) {
      return true;
    }
    if (id.startsWith("node:")) {
      return true;
    }

    if (id === "pino" || id.startsWith("pino/") || id.startsWith("pino-")) {
      return true;
    }
    if (id === "sonic-boom" || id.startsWith("sonic-boom/")) {
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
      skip: ["pino", "sonic-boom", /^pino.*/],
    }),

    commonjs({
      include: /node_modules/,
      exclude: [
        "**/pino/**",
        "**/sonic-boom/**",
        "**/thread-stream/**",
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
