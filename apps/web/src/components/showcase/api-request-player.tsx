'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MediaLightbox,
  preloadFullSources,
  type MediaLightboxLabels,
  type MediaSource,
} from '@nicobehm/media-kit';
import type { ApiDemoExample, ApiDemoExampleId, ApiDemoPreview } from '@/data/api-demo';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { AlertTriangleIcon } from '@/components/icons/alert-triangle-icon';
import { FullscreenIcon } from '@/components/icons/fullscreen-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/tabs';
import { GalleryAudioTile } from './gallery-audio-tile';

const PENDING_MS = 600;
/** ~800 caracteres/s a 60fps ≈ 13.3 car/frame, redondeado a 14. */
const CHARS_PER_FRAME = 14;
const COPY_FEEDBACK_MS = 2000;

type PlayerState = 'idle' | 'pending' | 'streaming' | 'done';

export type ApiRequestPlayerLabels = {
  endpoint: string;
  examples: Record<ApiDemoExampleId, string>;
  run: string;
  running: string;
  /** Etiqueta de estado (font-mono) junto al spinner mientras `state === 'pending'`. */
  pending: string;
  /** Etiqueta de estado (font-mono) junto al caret mientras `state === 'streaming'`. */
  streaming: string;
  copy: string;
  copied: string;
  done: string;
  /** Contenido del `<pre>` de respuesta en `state === 'idle'`, antes de la primera ejecución. */
  responsePlaceholder: string;
  /** Nombre accesible del tab "Preview" (T13, columna visor Preview|Response). */
  previewTab: string;
  /** Nombre accesible del tab "Response". */
  responseTab: string;
  /** Placeholder del panel Preview mientras `state !== 'done'` (idle/pending/streaming). */
  previewIdle: string;
  /** `alt` de la imagen de preview mostrada en `state === 'done'`. */
  previewAlt: string;
  /** aria-label del botón ⛶ que precarga el HD y abre el lightbox. */
  fullscreen: string;
  previewError: string;
  audio: { play: string; pause: string };
  /**
   * Chrome del `MediaLightbox` (zoom, fit, cerrar, ayuda…). Reutiliza el mismo
   * bloque i18n compartido (`lightboxLabels`) que `GalleryDemo`/`MediaKitDemo`:
   * sin esto el lightbox cae a sus labels por defecto EN INGLÉS incluso en /es/,
   * un finding seguro de review (regla del proyecto: i18n completo en toda UI visible).
   */
  lightbox: MediaLightboxLabels;
};

type Props = { examples: readonly ApiDemoExample[]; labels: ApiRequestPlayerLabels };

function selectedExample(
  examples: readonly ApiDemoExample[],
  exampleId: ApiDemoExampleId,
): ApiDemoExample {
  const example = examples.find((entry) => entry.id === exampleId) ?? examples[0];
  if (!example) throw new Error('ApiRequestPlayer requiere al menos un ejemplo');
  return example;
}

function renderDonePreview(
  preview: ApiDemoPreview,
  labels: ApiRequestPlayerLabels,
  handlers: { preload: () => void; openLightbox: () => void },
) {
  if (preview.kind === 'error') {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-control border border-border bg-surface p-4 text-center">
        <span className="text-danger">
          <AlertTriangleIcon />
        </span>
        <p className="text-sm text-fg-muted">{labels.previewError}</p>
      </div>
    );
  }

  const fullscreenButton = (
    <button
      type="button"
      aria-label={labels.fullscreen}
      onPointerEnter={handlers.preload}
      onFocus={handlers.preload}
      onClick={handlers.openLightbox}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-surface/80 text-fg backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <FullscreenIcon />
    </button>
  );

  if (preview.kind === 'image') {
    return (
      <div className="relative h-64">
        <img
          src={preview.src}
          alt={labels.previewAlt}
          width={preview.width}
          height={preview.height}
          className="h-full w-full object-contain"
        />
        {fullscreenButton}
      </div>
    );
  }

  if (preview.kind === 'video') {
    return (
      <div className="relative h-64">
        <video
          controls
          muted
          playsInline
          src={preview.src}
          poster={preview.poster}
          width={preview.width}
          height={preview.height}
          aria-label={labels.previewAlt}
          className="h-full w-full object-contain"
        />
        {fullscreenButton}
      </div>
    );
  }

  return (
    <div className="relative flex h-64 flex-col items-center gap-2 p-2">
      <img
        src={preview.cover}
        alt={labels.previewAlt}
        width={preview.width}
        height={preview.height}
        className="h-40 w-full object-contain"
      />
      <div className="w-full max-w-sm">
        <GalleryAudioTile
          cover={preview.cover}
          src={preview.src}
          width={preview.width}
          height={preview.height}
          labels={labels.audio}
          hideCover
        />
      </div>
      {fullscreenButton}
    </div>
  );
}

/**
 * Demo interactiva de un endpoint (T19, split v2 en T13): columna request
 * (método+path, `<pre>` de la request, botón Run al pie) + columna visor
 * (fila de estado SIEMPRE reservada `min-h-8` + Tabs Preview|Response). El
 * botón Run simula una llamada real — 600 ms de latencia (`pending`, spinner)
 * y la respuesta escribiéndose en streaming (rAF, ~14 car/frame) con caret,
 * hasta `done` (status badge + botón copy + preview de imagen con fullscreen).
 * Con `prefers-reduced-motion` la respuesta aparece completa, sin typing.
 * Reejecutable desde cualquier estado.
 *
 * Cero layout shift (T13): todo estado vive dentro de cajas de altura fija
 * (`min-h-8` la fila de estado; `h-64` ambos paneles de Tabs, que además
 * quedan siempre montados — B2 de F3.6 — así que cambiar de tab tampoco
 * desplaza nada). Nada se monta/desmonta fuera de esas cajas.
 *
 * Reutilizada en F4 con request/response reales del playground (`examples`/`labels`
 * son props, nada hardcodeado en el componente salvo el propio comportamiento).
 */
export function ApiRequestPlayer({ examples, labels }: Props) {
  const [exampleId, setExampleId] = useState<ApiDemoExampleId>(examples[0]?.id ?? 'image');
  const [state, setState] = useState<PlayerState>('idle');
  const [responseText, setResponseText] = useState('');
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const frame = useRef<number | null>(null);

  const example = selectedExample(examples, exampleId);
  const requestText = JSON.stringify(example.request, null, 2);
  const fullResponse = JSON.stringify(example.response, null, 2);
  const previewMedia: MediaSource | undefined =
    example.preview.kind === 'image'
      ? {
          src: example.preview.src,
          fullSrc: example.preview.fullSrc,
          alt: labels.previewAlt,
        }
      : example.preview.kind === 'audio'
        ? {
            src: example.preview.cover,
            fullSrc: example.preview.coverHd,
            alt: labels.previewAlt,
          }
        : undefined;

  useEffect(() => {
    return () => {
      clearTimeout(pendingTimeout.current);
      clearTimeout(copyTimeout.current);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function run() {
    clearTimeout(pendingTimeout.current);
    if (frame.current != null) cancelAnimationFrame(frame.current);
    setCopied(false);
    setResponseText('');
    setState('pending');

    pendingTimeout.current = setTimeout(() => {
      if (prefersReducedMotion()) {
        setResponseText(fullResponse);
        setState('done');
        return;
      }
      setState('streaming');
      let index = 0;
      const tick = () => {
        index = Math.min(fullResponse.length, index + CHARS_PER_FRAME);
        setResponseText(fullResponse.slice(0, index));
        if (index < fullResponse.length) {
          frame.current = requestAnimationFrame(tick);
        } else {
          frame.current = null;
          setState('done');
        }
      };
      frame.current = requestAnimationFrame(tick);
    }, PENDING_MS);
  }

  function selectExample(id: ApiDemoExampleId) {
    clearTimeout(pendingTimeout.current);
    clearTimeout(copyTimeout.current);
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setCopied(false);
    setResponseText('');
    setLightboxOpen(false);
    setState('idle');
    setExampleId(id);
  }

  async function copy() {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(fullResponse);
      setCopied(true);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Sin feedback de error dedicado: esta demo no simula fallos de portapapeles.
    }
  }

  /** Precarga el HD de la preview en hover/focus del botón ⛶, antes del click real. */
  function preloadPreview() {
    if (previewMedia) preloadFullSources([previewMedia]);
  }

  const isRunning = state === 'pending' || state === 'streaming';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Columna request: método+path + <pre> de la request + Run al pie de la columna. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="flex h-9 items-center gap-2">
            <span className="text-sm text-fg-muted">{labels.endpoint}</span>
            <select
              value={exampleId}
              onChange={(event) => {
                const selected = examples.find((entry) => entry.id === event.target.value);
                if (selected) selectExample(selected.id);
              }}
              aria-label={labels.endpoint}
              className="h-9 min-w-0 flex-1 cursor-pointer rounded-control border border-border bg-surface px-2 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {examples.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {labels.examples[entry.id]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 font-mono text-sm text-fg-muted">
            <span className="font-semibold text-fg">{example.method}</span>
            <span>{example.path}</span>
          </div>
          <pre
            data-testid="player-request-pane"
            className="h-40 overflow-auto whitespace-pre-wrap rounded-control border border-border bg-surface p-4 font-mono text-sm text-fg"
          >
            {requestText}
          </pre>
        </div>
        <div className="mt-auto">
          <Button onClick={run} disabled={isRunning}>
            {isRunning ? labels.running : labels.run}
          </Button>
        </div>
      </div>

      {/* Columna visor: fila de estado reservada + Tabs Preview|Response. */}
      <div className="flex flex-col gap-2">
        {/* SIEMPRE renderizada (incluso en idle, vacía): reserva min-h-8 para que
            aparecer/desaparecer spinner, label o badge no desplace el layout. */}
        <div data-testid="player-status-row" className="flex min-h-8 items-center gap-2">
          {state === 'pending' && (
            <>
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
              />
              <span className="font-mono text-sm text-fg-muted">{labels.pending}</span>
            </>
          )}
          {state === 'streaming' && (
            <span className="font-mono text-sm text-fg-muted">{labels.streaming}</span>
          )}
          {state === 'done' && (
            <>
              <Badge variant={example.status.startsWith('4') ? 'danger' : 'accent'}>
                {example.status}
              </Badge>
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? labels.copied : labels.copy}
              </Button>
            </>
          )}
        </div>

        <Tabs defaultValue="response">
          <TabList label={`${labels.previewTab} / ${labels.responseTab}`}>
            <Tab value="preview">{labels.previewTab}</Tab>
            <Tab value="response">{labels.responseTab}</Tab>
          </TabList>

          <TabPanel value="preview">
            {state === 'done' ? (
              renderDonePreview(example.preview, labels, {
                preload: preloadPreview,
                openLightbox: () => setLightboxOpen(true),
              })
            ) : (
              <div className="flex h-64 items-center justify-center rounded-control border border-border bg-surface p-4 text-center text-sm text-fg-muted">
                {labels.previewIdle}
              </div>
            )}
          </TabPanel>

          <TabPanel value="response">
            <pre
              data-testid="player-response-pane"
              className="h-64 overflow-auto whitespace-pre-wrap rounded-control border border-border bg-surface p-4 font-mono text-sm text-fg"
            >
              {state === 'idle' ? labels.responsePlaceholder : responseText}
              {state === 'streaming' && (
                <span aria-hidden className="animate-pulse">
                  ▌
                </span>
              )}
            </pre>
          </TabPanel>
        </Tabs>

        {/* Único aria-live del componente: anuncia la llegada de la respuesta, no el
            texto que se va escribiendo (evita verbosidad en streaming). */}
        <div role="status" className="sr-only">
          {state === 'done' ? labels.done : ''}
        </div>
      </div>

      <MediaLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        label={labels.previewAlt}
        labels={labels.lightbox}
        media={previewMedia}
      >
        {example.preview.kind === 'video' ? (
          <video
            controls
            autoPlay
            muted
            playsInline
            src={example.preview.src}
            poster={example.preview.poster}
          />
        ) : null}
      </MediaLightbox>
    </div>
  );
}
