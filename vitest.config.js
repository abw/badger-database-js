import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.js'],
    exclude: ['test/library/*.js'],
    fileParallelism: false,
    reporters: ['html'],
    outputFile: './tmp/test/index.html',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reportsDirectory: './tmp/coverage'
    },
  },
})