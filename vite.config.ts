import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { adminApiDevelopmentPlugin } from "./dev/admin-api-development-plugin";

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    const environment = loadEnv(mode, process.cwd(), "");
    for (const [key, value] of Object.entries(environment)) {
      process.env[key] ??= value;
    }
  }

  return {
    plugins: [react(), adminApiDevelopmentPlugin()],
  };
});
