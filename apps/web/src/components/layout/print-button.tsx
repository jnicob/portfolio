'use client';

import { PrinterIcon } from '@/components/icons/printer-icon';
import { Button } from '@/components/ui/button';

type PrintButtonProps = {
  label: string;
};

/**
 * "Print CV" / "Save PDF" button: executes `window.print()` when clicked.
 * On small screens (mobile) it shows only the icon with the accessible label for screen readers.
 * `no-print`: Hidden when printing.
 */
export function PrintButton({ label }: PrintButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => window.print()}
      title={label}
      aria-label={label}
      className="no-print"
    >
      <PrinterIcon />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
