import esbuild from "esbuild";

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian", "electron", "node:*", "path", "child_process"],
    format: "cjs",
    target: "ES6",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    minify: prod,
    outfile: "main.js",
  })
  .catch(() => process.exit(1));
