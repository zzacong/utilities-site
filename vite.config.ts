import { fileURLToPath, URL } from 'node:url'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  // allows the dev server to be reached over the tailnet (tailscale serve)
  server: {
    allowedHosts: ['.ts.net'],
  },
  resolve: {
    // resolves `paths` from tsconfig.json natively (replaces vite-tsconfig-paths)
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,

      manifest: {
        name: 'Utilities for devs',
        short_name: 'Util',
        description: 'vite-pwa',
        start_url: '/kebab-case',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
      },
      devOptions: {
        enabled: true,
        // navigateFallback: 'index.html',
        // suppressWarnings: true,
        // type: 'module',
      },
    }),
  ],
})

export default config
