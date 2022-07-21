import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json';

// Silence circular dependency warnings
const ignoreWarnings = {
  //'Circular dependency: src/Badger/Filesystem/File.js -> src/Badger/Filesystem/Directory.js -> src/Badger/Filesystem/File.js': true,
  //'Circular dependency: src/Badger/Filesystem/Directory.js -> src/Badger/Filesystem/File.js -> src/Badger/Filesystem/Directory.js': true,
};

const onwarn = (warning, warn) => {
  if (
    warning.code === 'CIRCULAR_DEPENDENCY'
    && ignoreWarnings[warning.message]
  ) {
    return
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
      commonjs()
    ],
    external: [],
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
