import { defineConfig } from 'tsup';
import fs from 'fs';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  // Los componentes son client components en consumidores React Server Components.
  banner: { js: "'use client';" },
  async onSuccess() {
    fs.copyFileSync('src/styles.css', 'dist/styles.css');
  },
});
