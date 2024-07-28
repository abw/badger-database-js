import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['vitest/**/*.js'],
    exclude: ['vitest/library/*.js'],
    fileParallelism: false,
  },
})