import fs from "fs";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      server: {
        https: {
          key: fs.readFileSync("../cert/key.pem"),
          cert: fs.readFileSync("../cert/cert.pem"),
        },
      },
    };
  }

  // Production config (Vercel build)
  return {};
});
