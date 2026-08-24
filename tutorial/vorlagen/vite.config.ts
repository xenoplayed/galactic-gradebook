import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Im Container muss Vite auf allen Interfaces lauschen. Der Default 'localhost'
    // bindet nur auf das Loopback-Interface *des Containers* - vom Mac aus waere
    // der Dev-Server dann trotz Port-Forwarding nicht erreichbar.
    host: '0.0.0.0',
    port: 5173,
    // Ohne strictPort weicht Vite bei belegtem Port still auf 5174 aus.
    // Das Port-Forwarding des DevContainers zeigt dann ins Leere.
    strictPort: true,
    watch: {
      // Ueber einen Bind-Mount vom Host in den Container (Podman/Docker auf
      // macOS und Windows) kommen keine inotify-Events an. Ohne Polling merkt
      // Vite Dateiaenderungen NIE: HMR feuert nicht, und selbst ein harter
      // Reload liefert weiter die alte Version aus dem Modulgraphen.
      // Kostet etwas CPU - dafuer funktioniert Speichern-und-Sehen.
      usePolling: true,
      interval: 300,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
