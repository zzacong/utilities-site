import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Test-only config. It skips the app's Vite plugins (TanStack Start, Nitro, PWA),
// which stop Vitest 5 from loading @babel/parser 8 in the node environment.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
