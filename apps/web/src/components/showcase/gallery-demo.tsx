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
  /** aria-label del botón ⛶; plantilla con `{title}` (helper local `fill`). */
  fullscreen: string;
  audio: GalleryAudioTileLabels;
  lightbox: MediaLightboxLabels;
};

type Props = { locale: 'es' | 'en'; labels: GalleryDemoLabels };

const TILE_EXTRA_HEIGHT = 28;
const LAYOUTS = ['grid', 'masonry', 'justified'] as const satisfies readonly FilterGalleryLayout[];

/** Interpola `{title}` en una plantilla i18n. La interpolación es por ítem: no puede hacerla `t()` en la page. */
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

/** Título visible + buscable: modelo primero para que la búsqueda encuentre por modelo. */
function itemTitle(item: GalleryItem, locale: 'es' | 'en'): string {
  return `${item.model} — ${item.title[locale]}`;
}

/** Medio a precargar/mostrar en el lightbox por tipo. Vídeo no tiene variante HD propia (usa `<video>` nativo). */
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
 * Réplica manual de `pickFullscreenSrc` (no exportada por el paquete) para el
 * caso audio: el lightbox usa `children` en vez de `media` (ver comentario en
 * `GalleryDemo`), así que la elección base/HD de la carátula grande la hace
 * este componente con la misma regla (`shouldUseFullSrc`, sí exportada).
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
 * Tile por tipo + botón ⛶ solo-icono. La `<img>`/carátula de fondo es decorativa
 * (`alt=""`): el título visible vive en el `<figcaption>`, no duplicado para
 * lectores de pantalla (review T10).
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
 * Contenido del lightbox: image usa `media` (el paquete resuelve fullSrc/base
 * según pantalla vía `pickFullscreenSrc`); vídeo y audio usan `children`, porque
 * `MediaLightbox` prioriza `media` > `children` (son excluyentes) y ambos
 * necesitan un elemento interactivo debajo del medio (el `<video controls>`
 * nativo, o la carátula + `GalleryAudioTile` para seguir controlando el play).
 *
 * El audio NO puede confiar en el `data-fit` del lightbox (fix review T11): esas
 * reglas de sizing solo alcanzan a un `<img>`/`<video>` HIJO DIRECTO de
 * `.mk-lightbox__media` (ver comentario de `MediaLightboxProps.children` en el
 * paquete), que además es flex ROW por defecto — un `<>...</>` con la carátula y
 * el player quedaría lado a lado y sin tamaño. Por eso el audio se envuelve en su
 * propio contenedor en columna con layout autogestionado (carátula acotada por
 * alto + player de ancho acotado debajo).
 *
 * Fix design review T25 (I1): la carátula grande de aquí + la carátula propia de
 * `GalleryAudioTile` duplicaban la misma imagen y la columna (≈1030px) desbordaba
 * un viewport de 900px de alto. `GalleryAudioTile` recibe `hideCover` para pintar
 * solo controles compactos (botón + barra), y la carátula grande baja a
 * `max-h-[60dvh]` (antes 70dvh) para dejarle sitio.
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
 * Galería de ejemplos IA completa (F3.7 T11): búsqueda + filtro por categoría
 * (combinados vía `visibleIds`, T3) + tile por tipo + lightbox HD por ítem.
 */
export function GalleryDemo({ locale, labels }: Props) {
  const [query, setQuery] = useState('');
  // Filtro de categoría controlado (en vez de dejarlo interno a FilterGallery, fix
  // review T11): `hasResults` necesita conocer la categoría activa para computar la
  // intersección REAL categoría AND búsqueda — con el filtro sin controlar, FilterGallery
  // podía terminar mostrando 0 tiles (categoría + búsqueda sin coincidencias) sin que
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
