'use client';

import type { MediaLightboxLabels } from './media-lightbox';

export type LightboxHelpProps = {
  labels: MediaLightboxLabels;
};

type ShortcutLabelKey =
  | 'shortcutZoom'
  | 'shortcutReset'
  | 'shortcutPanKeys'
  | 'shortcutPanDrag'
  | 'shortcutFit'
  | 'shortcutFullscreen'
  | 'shortcutControls'
  | 'shortcutHelp'
  | 'shortcutClose';

type HelpRow = { keys: string[]; label: ShortcutLabelKey };

// Teclas/gestos literales (no traducibles, por diseño); las descripciones salen de labels.
// La fila de fit muestra el glifo del botón de la toolbar: el ciclo de ajuste no tiene tecla.
const ROWS: HelpRow[] = [
  { keys: ['+', '−', 'wheel', 'double-click'], label: 'shortcutZoom' },
  { keys: ['0'], label: 'shortcutReset' },
  { keys: ['←', '↑', '→', '↓'], label: 'shortcutPanKeys' },
  { keys: ['Space'], label: 'shortcutPanDrag' },
  { keys: ['▣'], label: 'shortcutFit' },
  { keys: ['f'], label: 'shortcutFullscreen' },
  { keys: ['c'], label: 'shortcutControls' },
  { keys: ['?'], label: 'shortcutHelp' },
  { keys: ['Esc'], label: 'shortcutClose' },
];

/**
 * Panel presentacional del mapa de teclado. La visibilidad, el foco y la
 * precedencia de Escape los gobierna media-lightbox (estado helpOpen).
 * role="group" (no dialog): ya vivimos dentro de un dialog modal.
 */
export function LightboxHelp({ labels }: LightboxHelpProps) {
  return (
    <div
      role="group"
      aria-label={labels.helpTitle}
      className="mk-lightbox__help"
      data-mk-help=""
      tabIndex={-1}
    >
      <p className="mk-lightbox__help-title" aria-hidden="true">
        {labels.helpTitle}
      </p>
      <dl>
        {ROWS.map((row) => (
          <div key={row.label} className="mk-lightbox__help-row">
            <dt>
              {row.keys.map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </dt>
            <dd>{labels[row.label]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
