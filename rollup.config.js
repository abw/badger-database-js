import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser'

// Silence circular dependency warnings
const ignoreWarnings = [
  /glob\.js/,
  /node-pre-gyp/,
  /readable-stream/,
  /semver/,
  /mysql2/,
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
    // Knex.js includes a bunch of modules that may, or may not
    // be required depending on which backend database you use
    external: [
      "node:fs",
      "node:path",
      "node:process",
      "node:fs/promises",
      "assert",
      "aws-sdk",
      "better-sqlite3",
      "buffer",
      "cardinal",
      "child_process",
      "crypto",
      "events",
      "fs",
      "mock-aws-s3",
      "mysql",
      "net",
      "nock",
      "oracledb",
      "os",
      "path",
      "pg",
      "pg-query-stream",
      "process",
      "readline",
      "stream",
      "string_decoder",
      "tedious",
      "timers",
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
