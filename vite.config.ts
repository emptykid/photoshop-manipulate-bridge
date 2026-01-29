import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        exports: 'named',
        inlineDynamicImports: true,
      },
      plugins: [
        alias({
          entries: [
            { find: 'ws', replacement: resolve(__dirname, 'node_modules/ws/index.js') },
          ],
        }),
        nodeResolve({
          preferBuiltins: true,
          browser: false,
          exportConditions: ['node', 'require'],
          mainFields: ['main', 'module'],
        }),
        commonjs(),
      ],
    },
    minify: false,
    sourcemap: true,
    target: 'node18',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    conditions: ['node', 'require', 'default'],
    mainFields: ['main', 'module'],
    browserField: false,
  },
  plugins: [
    {
      name: 'copy-package-json',
      closeBundle() {
        const pkg = JSON.parse(
          readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
        );
        // Create a minimal package.json for the plugin
        const pluginPkg = {
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
          author: pkg.author,
          license: pkg.license,
          main: 'index.js',
          engines: {
            photoshop: '>=14.0.0',
            node: '>=18.0.0',
          },
        };
        writeFileSync(
          resolve(process.cwd(), 'dist/package.json'),
          JSON.stringify(pluginPkg, null, 2)
        );
      },
    },
  ],
});
