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
import { Select } from '@/components/ui/select';
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
  /** Response `<pre>` content when `state === 'idle'`, before the first run. */
  responsePlaceholder: string;
  /** Nombre accesible del tab "Preview" (T13, columna visor Preview|Response). */
  previewTab: string;
  /** Nombre accesible del tab "Response". */
  responseTab: string;
  /** Placeholder del panel Preview mientras `state !== 'done'` (idle/pending/streaming). */
  previewIdle: string;
  /** `alt` de la imagen de preview mostrada en `state === 'done'`. */
  previewAlt: string;
  /** aria-label for the ⛶ button that preloads HD and opens the lightbox. */
  fullscreen: string;
  previewError: string;
  audio: { play: string; pause: string };
  /**
   * Chrome of `MediaLightbox` (zoom, fit, close, help…). Reuses the same
   * shared i18n block (`lightboxLabels`) as `GalleryDemo`/`MediaKitDemo`:
   * without this the lightbox falls back to its default labels IN ENGLISH even on /es/,
   * a guaranteed review finding (project rule: full i18n on all visible UI).
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
 * Interactive endpoint demo (T19, split v2 in T13): request column
 * (method+path, request `<pre>`, Run button at the bottom) + viewer column
 * (status row ALWAYS reserved `min-h-8` + Tabs Preview|Response). The
 * Run button simulates a real call — 600 ms latency (`pending`, spinner)
 * and the response being written via streaming (rAF, ~14 chars/frame) with caret,
 * until `done` (status badge + copy button + image preview with fullscreen).
 * With `prefers-reduced-motion` the response appears complete, without typing.
 * Rerunable from any state.
 *
 * Zero layout shift (T13): all state lives inside fixed-height boxes
 * (`min-h-8` for the status row; `h-64` for both Tab panels, which also
 * remain always mounted — B2 of F3.6 — so switching tabs doesn't
 * shift anything either). Nothing mounts/unmounts outside of those boxes.
 *
 * Reused in F4 with real playground request/response (`examples`/`labels`
 * are props, nothing hardcoded in the component except the behavior itself).
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

  /** Preloads the preview HD on hover/focus of the ⛶ button, before the actual click. */
  function preloadPreview() {
    if (previewMedia) preloadFullSources([previewMedia]);
  }

  const isRunning = state === 'pending' || state === 'streaming';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Request column: method+path + request <pre> + Run at the bottom of the column. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="flex h-9 items-center gap-2">
            <span className="text-sm text-fg-muted">{labels.endpoint}</span>
            <Select
              value={exampleId}
              onChange={(event) => {
                const selected = examples.find((entry) => entry.id === event.target.value);
                if (selected) selectExample(selected.id);
              }}
              aria-label={labels.endpoint}
              options={examples.map((entry) => ({
                value: entry.id,
                label: labels.examples[entry.id],
              }))}
              // w-auto overrides (via tailwind-merge) the default w-full of Select: here
              // el ancho lo gobierna flex-1 y el w-full quedaba como utility muerta.
              className="h-9 w-auto min-w-0 flex-1 cursor-pointer px-2 font-mono"
            />
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
        {/* ALWAYS rendered (even in idle, empty): reserves min-h-8 so that
            showing/hiding spinner, label, or badge does not shift the layout. */}
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
              <Badge variant={/^[45]/.test(example.status) ? 'danger' : 'accent'}>
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

        {/* Component's only aria-live: announces the arrival of the response, not the
            text being typed (avoids verbosity during streaming). */}
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
