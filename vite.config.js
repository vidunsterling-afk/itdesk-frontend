import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // ✅ Add this import

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      plugins: [react()], // ✅ Use the React plugin
      server: {
        https: {
          key: fs.readFileSync("../cert/key.pem"),
          cert: fs.readFileSync("../cert/cert.pem"),
        },
      },
    };
  }

  // ✅ Production config (used by Vercel)
  return {
    plugins: [react()],
  };
});
