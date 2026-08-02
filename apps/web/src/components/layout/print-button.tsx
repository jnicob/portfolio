'use client';

import { PrinterIcon } from '@/components/icons/printer-icon';
import { Button } from '@/components/ui/button';

type PrintButtonProps = {
  label: string;
};

/**
 * Botón "Imprimir CV" / "Guardar PDF": ejecuta `window.print()` al pulsar.
 * En pantallas pequeñas (mobile) muestra solo el icono con la etiqueta accesible para lectores de pantalla.
 * `no-print`: Oculto al imprimir.
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
