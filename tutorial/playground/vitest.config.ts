import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Die Tests importieren aus `@target/...`. Normal zeigt das auf `uebungen/` -
 * also auf deinen Code. Mit PLAYGROUND_TARGET=loesungen laufen dieselben Tests
 * gegen die Musterloesungen; so kannst du pruefen, ob ein Test ueberhaupt
 * erfuellbar ist, wenn du an einer Aufgabe haengst.
 */
const target = process.env.PLAYGROUND_TARGET === 'loesungen' ? './loesungen' : './uebungen'

export default defineConfig({
  resolve: {
    alias: {
      '@target': fileURLToPath(new URL(target, import.meta.url)),
    },
  },
})
