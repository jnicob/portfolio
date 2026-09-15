import './globals.css';

// Init de tema minimalista: el root layout no renderiza <html>/<body> (los pone
// [locale]/layout.tsx), so there is no default data-theme here. document.documentElement
// is ALWAYS the real <html> constructed by the browser, even if no JSX in this tree
// explicitly declares it — setting it here is enough for token utilities
// (bg-bg/text-fg/text-accent, imported from globals.css) to resolve their variables.
// Mismo criterio que themeInitScript en [locale]/layout.tsx (URL > stored > sistema),
// Simplified: this page does not read `?theme=` because it is not a normal navigation destination.
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
 * Root 404 (T26 finding 3): captures any route not matching any known locale
 * (e.g. `/nonexistent-page`, without `/en` or `/es` prefix) — `[locale]/not-found.tsx`
 * only covers misses WITHIN an already resolved locale. Bilingual and static
 * (without next-intl: this segment has no locale to read).
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
