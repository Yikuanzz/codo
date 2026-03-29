import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/codo/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
