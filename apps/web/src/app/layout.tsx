import type { ReactNode } from 'react';

// Minimal root: per-locale <html lang> is rendered by app/[locale]/layout.tsx.
// Only static redirect pages hang from here.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
