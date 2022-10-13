import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser'

// Silence circular dependency warnings
const ignoreWarnings = [
  // EXAMPLE: /example/,
]

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    for (let pattern of ignoreWarnings) {
      if (warning.message.match(pattern)) {
        return;
      }
    }
  }
  warn(warning);
}

export default [
  {
    input: 'src/index.js',
    plugins: [
      resolve({
        extensions: ['.js', '.jsx'],
      }),
      commonjs(),
      json()
    ],
    external: [
      "node:fs",
      "node:path",
      "node:process",
      "node:fs/promises",
      "better-sqlite3",
      "child_process",
      "mysql2",
      "mysql2/promise",
      "sqlite3",
      "events",
      "fs",
      "path",
      "process",
      "readline",
      "timers",
      "assert",
      "aws-sdk",
      "buffer",
      "cardinal",
      "crypto",
      "knex",
      "mock-aws-s3",
      "mysql",
      "net",
      "nock",
      "oracledb",
      "os",
      "pg",
      "pg-query-stream",
      "stream",
      "string_decoder",
      "tedious",
      "tls",
      "tty",
      "util",
      "url",
      "zlib"
    ],
    onwarn,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        plugins: [terser()]
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        exports: 'named',
        plugins: [terser()]
      }
    ]
  }
];
