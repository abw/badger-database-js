import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.js'],
    exclude: ['test/library/*.js'],
    fileParallelism: false,
  },
})