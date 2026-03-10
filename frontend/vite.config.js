import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path"
import { copyFileSync, existsSync } from "fs"

// Auto-copies _redirects into dist/ after every build
// Required for Netlify drag & drop deploys
const copyRedirects = () => ({
  name: "copy-redirects",
  closeBundle() {
    const src  = resolve(__dirname, "public/_redirects");
    const dest = resolve(__dirname, "dist/_redirects");
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log("✅ _redirects copied to dist/");
    }
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyRedirects(),
  ],
  server: {
    proxy: {
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})