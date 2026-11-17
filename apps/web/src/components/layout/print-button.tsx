'use client';

import { useEffect } from 'react';
import { PrinterIcon } from '@/components/icons/printer-icon';
import { Button } from '@/components/ui/button';

type PrintButtonProps = {
  label: string;
};

/**
 * Purges active browser search/selection highlights before capturing the print snapshot:
 * 1. Clears DOM selection ranges (`window.getSelection()`).
 * 2. Clears CSS Custom Highlight API registries (`CSS.highlights`).
 * 3. Unwraps `<mark>` tags injected by search/highlighter extensions.
 * 4. Resets `CharacterData` on leaf `Text` nodes in place (preserving React fiber node
 *    references) so Chromium/Blink's `DocumentMarkerController` drops active `Ctrl+F`
 *    (`kTextMatch`) and URL text-fragment (`kTextFragment`) yellow highlights.
 */
export function clearPrintHighlights(root: ParentNode = document.body): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.getSelection?.()?.removeAllRanges?.();

  const cssApi = (globalThis as { CSS?: { highlights?: { clear?: () => void } } }).CSS;
  cssApi?.highlights?.clear?.();

  const marks = root.querySelectorAll('mark');
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
      parent.normalize();
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    const value = textNode.data;
    if (value.length > 0) {
      textNode.data = '';
      textNode.data = value;
    }
    current = walker.nextNode();
  }
}

/**
 * "Print CV" / "Save PDF" button: clears search highlights and executes `window.print()`.
 * Also listens to `beforeprint` on `window` so keyboard shortcuts (`Ctrl+P` / `Cmd+P`)
 * benefit from the same highlight cleanup.
 */
export function PrintButton({ label }: PrintButtonProps) {
  useEffect(() => {
    const handleBeforePrint = () => {
      clearPrintHighlights();
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  function handlePrint() {
    clearPrintHighlights();
    window.print();
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handlePrint}
      title={label}
      aria-label={label}
      className="no-print"
    >
      <PrinterIcon />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
