import './globals.css';

// Init de tema minimalista: el root layout no renderiza <html>/<body> (los pone
// [locale]/layout.tsx) así que aquí no hay data-theme por defecto. document.documentElement
// SIEMPRE es el <html> real que el navegador construye, aunque ningún JSX de este árbol
// lo declare explícitamente — fijarlo aquí basta para que las utilities de tokens
// (bg-bg/text-fg/text-accent, importadas de globals.css) resuelvan sus variables.
// Mismo criterio que themeInitScript en [locale]/layout.tsx (URL > stored > sistema),
// simplificado: esta página no lee `?theme=` porque no es un destino navegable normal.
const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();`;

/**
 * 404 raíz (T26 finding 3): captura cualquier ruta que no matchee ningún locale
 * conocido (p.ej. `/nonexistent-page`, sin prefijo `/en` o `/es`) — el `not-found.tsx`
 * de `[locale]` solo cubre misses DENTRO de un locale ya resuelto. Bilingüe y estático
 * (sin next-intl: este segmento no tiene locale que leer).
 */
export default function NotFound() {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex" />
        <title>404 — Nico Behm</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 bg-bg px-4 text-center text-fg">
        <p className="text-sm text-fg-muted">404</p>
        <h1 className="text-2xl font-semibold">Page not found · Página no encontrada</h1>
        <div className="flex flex-col gap-2 text-sm">
          <a
            href="/en"
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            English version →
          </a>
          <a
            href="/es"
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Versión en español →
          </a>
        </div>
      </body>
    </html>
  );
}
