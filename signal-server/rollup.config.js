import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import typescript from '@rollup/plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';


export default {
  input: './src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    //sourcemap: true
  },
  plugins: [
    commonjs(),
    resolve({extensions: ['.js', '.ts']}),
    typescript({ tsconfig: './tsconfig.json' }),
    json()
  ],
  external: ['express'] // Prevent bundling express, use it as an external dependency
};
