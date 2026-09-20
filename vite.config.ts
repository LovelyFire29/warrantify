import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, mergeConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(async ({ mode, command }) => {
  // Vite already exposes VITE_-prefixed env vars via import.meta.env for
  // client code, but SSR/server bundles need them inlined too, so define
  // them explicitly for both.
  const env = loadEnv(mode, rootDir, "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    viteReact(),
  ];

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ defaultPreset: "vercel" }));
  }

  return mergeConfig(
    {
      server: { host: "::", port: 8080 },
    },
    {
      define: envDefine,
      resolve: {
        alias: { "@": `${rootDir}src` },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      plugins,
    },
  );
});
