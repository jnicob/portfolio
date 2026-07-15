import type { ReactNode } from 'react';

// Root mínimo: el <html lang> por locale lo renderiza app/[locale]/layout.tsx.
// Solo las páginas de redirect estático cuelgan de aquí.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
