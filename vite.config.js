import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      exclude: [
        'test',
        'website'
      ],
    })
  ],
  build: {
    ssr: true,
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      name: '@abw/badger-database',
      fileName: 'badger-database'
    },
    rollupOptions: {
      external: [
        "node:buffer",
        "node:fs",
        "node:path",
        "node:process",
        "node:fs/promises",
        "better-sqlite3",
        "child_process",
        "mysql2",
        "mysql2/promise",
        "os",
        "sqlite3",
        "fsevents",
        "events",
        "fs",
        "path",
        "process",
        "readline",
        "timers",
        "pg",
      ],
    }
  },
  test: {
    include: ['test/**/*.[jt]s'],
    exclude: ['test/library/*.ts'],
    reporters: ['html'],
    outputFile: './tmp/test/index.html',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reportsDirectory: './tmp/coverage'
    },
  },
})
