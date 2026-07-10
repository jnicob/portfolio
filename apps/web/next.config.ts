import path from 'node:path';
import type { NextConfig } from 'next';
import { resolveOutputMode } from './src/lib/output-mode';

const mode = resolveOutputMode(process.env);

const nextConfig: NextConfig = {
  // Modo 'export': estático puro (hosting compartido). Modo 'node': SSR + route handlers.
  ...(mode === 'export' ? { output: 'export' as const } : {}),
  // output:'export' no soporta el optimizador de imágenes server-side.
  images: { unoptimized: mode === 'export' },
  // Fija la raíz del monorepo pnpm: evita que Turbopack detecte un lockfile
  // ajeno más arriba en el árbol de directorios (p. ej. en $HOME) como root.
  turbopack: { root: path.join(__dirname, '..', '..') },
};

export default nextConfig;
