import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Percorso relativo: la build funziona anche in una sottocartella (es. poc-lab.gs1it.dev/web-vocabulary/).
  base: process.env.BASE_PATH ?? './',
  plugins: [preact()],
  test: { environment: 'node' },
})
