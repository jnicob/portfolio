'use client';

import {
  FilterGallery,
  MediaLightbox,
  HoverVideo,
  preloadFullSources,
  shouldUseFullSrc,
  type FilterGalleryItem,
  type FilterGalleryLayout,
  type MediaLightboxLabels,
  type MediaSource,
} from '@nicobehm/media-kit';
import { useState } from 'react';
import { FullscreenIcon } from '@/components/icons/fullscreen-icon';
import { Input } from '@/components/ui/input';
import { galleryItems } from '@/data/gallery';
import type { GalleryItem } from '@/data/schemas';
import { GalleryAudioTile, type GalleryAudioTileLabels } from './gallery-audio-tile';

type AudioGalleryItem = Extract<GalleryItem, { type: 'audio' }>;

type GalleryLayoutLabels = {
  label: string;
  grid: string;
  masonry: string;
  justified: string;
};

export type GalleryDemoLabels = {
  filterLabel: string;
  allLabel: string;
  categories: { image: string; video: string; audio: string };
  layouts: GalleryLayoutLabels;
  searchLabel: string;
  searchPlaceholder: string;
  emptyState: string;
  /** aria-label for button ⛶; template with `{title}` (local helper `fill`). */
  fullscreen: string;
  audio: GalleryAudioTileLabels;
  lightbox: MediaLightboxLabels;
};

type Props = { locale: 'es' | 'en'; labels: GalleryDemoLabels };

const TILE_EXTRA_HEIGHT = 28;
const LAYOUTS = ['grid', 'masonry', 'justified'] as const satisfies readonly FilterGalleryLayout[];

/** Interpolates `{title}` into an i18n template. Interpolation is per item: `t()` cannot do it in the page. */
function fill(template: string, title: string): string {
  return template.replace('{title}', title);
}

/** Case/diacritics-insensitive: `'Café' → 'cafe'`. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Visible + searchable title: model first so search finds by model. */
function itemTitle(item: GalleryItem, locale: 'es' | 'en'): string {
  return `${item.model} — ${item.title[locale]}`;
}

/** Media to preload/show in the lightbox by type. Video has no dedicated HD variant (uses native `<video>`). */
function toMediaSource(item: GalleryItem, title: string): MediaSource {
  if (item.type === 'image') return { src: item.src, fullSrc: item.hdSrc, alt: title };
  if (item.type === 'audio') return { src: item.cover, fullSrc: item.coverHd, alt: title };
  return { src: item.poster, alt: title };
}

/** Fullscreen de imagen siempre usa el asset 2560px; solo se monta tras abrir el visor. */
function toFullscreenImageSource(
  item: Extract<GalleryItem, { type: 'image' }>,
  title: string,
): MediaSource {
  return { src: item.hdSrc, fullSrc: item.hdSrc, alt: title };
}

/**
 * Manual replica of `pickFullscreenSrc` (not exported by the package) for the
 * audio case: the lightbox uses `children` instead of `media` (see comment in
 * `GalleryDemo`), so the base/HD choice for the large cover is made by
 * this component using the same rule (`shouldUseFullSrc`, which is exported).
 */
function pickCoverSrc(item: AudioGalleryItem): string {
  if (typeof window === 'undefined') return item.cover;
  return shouldUseFullSrc(window.screen.width, window.devicePixelRatio) ? item.coverHd : item.cover;
}

type TileProps = {
  item: GalleryItem;
  title: string;
  labels: GalleryDemoLabels;
  layout: FilterGalleryLayout;
  onOpen: (item: GalleryItem) => void;
};

/**
 * Tile by type + icon-only ⛶ button. The background `<img>`/cover is decorative
 * (`alt=""`): the visible title lives in the `<figcaption>`, not duplicated for
 * screen readers (T10 review).
 */
function GalleryTile({ item, title, labels, layout, onOpen }: TileProps) {
  const gridMediaClass = layout === 'grid' ? 'aspect-square h-full w-full object-cover' : undefined;

  function preload() {
    preloadFullSources([toMediaSource(item, title)]);
  }

  return (
    <figure
      className={['relative flex flex-col gap-2', layout === 'grid' && 'h-full']
        .filter(Boolean)
        .join(' ')}
    >
      {item.type === 'image' && (
        <img
          src={item.src}
          alt=""
          loading="lazy"
          width={item.width}
          height={item.height}
          className={[
            'rounded-card',
            layout === 'grid' ? 'aspect-square h-full w-full object-cover' : 'w-full h-auto',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      )}
      {item.type === 'video' && (
        <HoverVideo
          src={item.src}
          poster={item.poster}
          label={title}
          width={item.width}
          height={item.height}
          className={layout === 'grid' ? 'aspect-square h-full w-full' : undefined}
          mediaClassName={gridMediaClass}
        />
      )}
      {item.type === 'audio' && (
        <GalleryAudioTile
          cover={item.cover}
          src={item.src}
          width={item.width}
          height={item.height}
          labels={{ play: fill(labels.audio.play, title), pause: fill(labels.audio.pause, title) }}
          className={layout === 'grid' ? 'aspect-square h-full w-full' : undefined}
          coverClassName={gridMediaClass}
        />
      )}
      <figcaption className="truncate text-sm text-fg-muted">{title}</figcaption>
      <button
        type="button"
        aria-label={fill(labels.fullscreen, title)}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => onOpen(item)}
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-surface/80 text-fg backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <FullscreenIcon />
      </button>
    </figure>
  );
}

/**
 * Lightbox content: image uses `media` (the package resolves fullSrc/base
 * depending on screen via `pickFullscreenSrc`); video and audio use `children`, because
 * `MediaLightbox` prioritizes `media` > `children` (they are mutually exclusive) and both
 * need an interactive element below the media (native `<video controls>`, or
 * the cover + `GalleryAudioTile` to continue controlling playback).
 *
 * Audio CANNOT rely on the lightbox's `data-fit` (T11 review fix): those
 * sizing rules only apply to an `<img>`/`<video>` DIRECT CHILD of
 * `.mk-lightbox__media` (see `MediaLightboxProps.children` comment in the
 * package), which is also flex ROW by default — a `<>...</>` with the cover and
 * the player would end up side-by-side with no size. That's why audio is wrapped in its
 * own column container with self-managed layout (height-constrained cover +
 * width-constrained player below).
 *
 * Design review fix T25 (I1): the large cover here + `GalleryAudioTile`'s own cover
 * duplicated the same image and the column (≈1030px) overflowed
 * a 900px high viewport. `GalleryAudioTile` receives `hideCover` to render
 * only compact controls (button + bar), and the large cover is reduced to
 * `max-h-[60dvh]` (previously 70dvh) to make room for it.
 */
function renderLightboxChildren(item: GalleryItem, title: string, labels: GalleryDemoLabels) {
  if (item.type === 'video') {
    return <video controls autoPlay muted playsInline src={item.src} poster={item.poster} />;
  }
  if (item.type === 'audio') {
    return (
      <figure
        data-testid="audio-lightbox-content"
        className="flex max-h-full max-w-full flex-col items-center gap-4 overflow-auto"
      >
        <img src={pickCoverSrc(item)} alt="" className="max-h-[60dvh] w-auto" />
        <div className="w-full max-w-sm">
          <GalleryAudioTile
            cover={item.cover}
            src={item.src}
            width={item.width}
            height={item.height}
            labels={{
              play: fill(labels.audio.play, title),
              pause: fill(labels.audio.pause, title),
            }}
            hideCover
          />
        </div>
      </figure>
    );
  }
  return null;
}

/**
 * Complete AI example gallery (F3.7 T11): search + category filter
 * (combined via `visibleIds`, T3) + tile by type + HD lightbox per item.
 */
export function GalleryDemo({ locale, labels }: Props) {
  const [query, setQuery] = useState('');
  // Controlled category filter (instead of leaving it internal to FilterGallery, fix
  // T11 review): `hasResults` needs to know the active category to compute the
  // REAL category AND search intersection — with an uncontrolled filter, FilterGallery
  // could end up showing 0 tiles (category + search with no matches) without
  // este componente se enterara para mostrar el empty state.
  const [category, setCategory] = useState<string | null>(null);
  const [layout, setLayout] = useState<FilterGalleryLayout>('masonry');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const titledItems = galleryItems.map((item) => ({ item, title: itemTitle(item, locale) }));

  const normalizedQuery = normalize(query);
  const visibleIds = normalizedQuery
    ? titledItems
        .filter(({ title }) => normalize(title).includes(normalizedQuery))
        .map(({ item }) => item.id)
    : undefined;
  const hasResults = titledItems.some(
    ({ item }) =>
      (category === null || item.type === category) &&
      (visibleIds === undefined || visibleIds.includes(item.id)),
  );

  const filterItems: FilterGalleryItem[] = titledItems.map(({ item, title }) => ({
    id: item.id,
    categories: [item.type],
    aspectRatio: item.width / item.height,
    node: (
      <GalleryTile
        item={item}
        title={title}
        labels={labels}
        layout={layout}
        onOpen={setLightboxItem}
      />
    ),
  }));

  const activeTitle = lightboxItem ? itemTitle(lightboxItem, locale) : '';
  const media =
    lightboxItem && lightboxItem.type === 'image'
      ? toFullscreenImageSource(lightboxItem, activeTitle)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label={labels.layouts.label} className="flex flex-wrap gap-2">
        {LAYOUTS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={layout === id}
            onClick={() => setLayout(id)}
            className="cursor-pointer rounded-full border-0 bg-(--mk-filter-bg) px-3 py-1.5 text-sm text-(--mk-filter-color) transition-colors hover:bg-(--mk-filter-hover-bg) aria-pressed:bg-accent aria-pressed:text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {labels.layouts[id]}
          </button>
        ))}
      </div>
      <Input
        type="search"
        aria-label={labels.searchLabel}
        placeholder={labels.searchPlaceholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <FilterGallery
        items={filterItems}
        categories={[
          { id: 'image', label: labels.categories.image },
          { id: 'video', label: labels.categories.video },
          { id: 'audio', label: labels.categories.audio },
        ]}
        allLabel={labels.allLabel}
        label={labels.filterLabel}
        filter={category}
        onFilterChange={setCategory}
        visibleIds={visibleIds}
        layout={layout}
        itemExtraHeight={TILE_EXTRA_HEIGHT}
      />
      {!hasResults && (
        <p role="status" className="text-sm text-fg-muted">
          {labels.emptyState}
        </p>
      )}
      <MediaLightbox
        open={lightboxItem !== null}
        onClose={() => setLightboxItem(null)}
        label={activeTitle}
        labels={labels.lightbox}
        fit={lightboxItem?.type === 'image' ? 'cover' : 'contain'}
        media={media}
      >
        {lightboxItem ? renderLightboxChildren(lightboxItem, activeTitle, labels) : null}
      </MediaLightbox>
    </div>
  );
}
