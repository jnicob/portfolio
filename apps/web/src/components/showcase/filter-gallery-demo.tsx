'use client';

import { FilterGallery, type FilterGalleryItem } from '@nicobehm/media-kit';

type Category = 'image' | 'video' | 'audio';

export type FilterGalleryDemoStrings = {
  /** Nombre accesible reutilizado por la botonera de filtros y por el grid (contrato del paquete: ambos usan el mismo `label`). */
  label: string;
  /** Etiqueta del botón "todos". */
  allLabel: string;
  /** Etiqueta de cada botón de filtro, una por categoría. */
  categoryLabels: Record<Category, string>;
  /** Etiqueta visible + accesible (SVG `<title>`) de cada uno de los 8 tiles: 3 imagen, 3 vídeo, 2 audio, en ese orden. */
  tileLabels: readonly [string, string, string, string, string, string, string, string];
  /** Texto del figcaption. */
  caption: string;
};

type Props = { strings: FilterGalleryDemoStrings };

/**
 * Icono inline por categoría, token-neutro: sin colores hardcodeados, solo
 * `currentColor` heredado del contenedor (spec B4 — "grises/acento vía
 * currentColor"). `role="img"` + `<title>` le da nombre accesible al SVG
 * (WAI-ARIA SVG img pattern), reutilizando la misma etiqueta que el tile.
 */
function CategoryIcon({ category, title }: { category: Category; title: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden={false}
    >
      <title>{title}</title>
      {category === 'image' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 15l-5-5-4 4-3-3-6 6" />
        </>
      )}
      {category === 'video' && (
        <>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="M16 10l5-3v10l-5-3z" />
        </>
      )}
      {category === 'audio' && <path d="M4 12v0M8 9v6M12 5v14M16 9v6M20 12v0" />}
    </svg>
  );
}

/**
 * Grid filtrable de 8 tiles SVG/emoji de categorías image/video/audio (spec
 * B4): sirve además de test visual del FLIP manual del paquete al cambiar de
 * filtro (ver comentario en `FilterGallery`).
 */
export function FilterGalleryDemo({ strings }: Props) {
  // Destructurar la tupla (en vez de indexarla con una variable) preserva el tipo
  // `string` exacto de cada posición bajo `noUncheckedIndexedAccess` (indexar con
  // un número no literal degradaría a `string | undefined`).
  const [img1, img2, img3, vid1, vid2, vid3, aud1, aud2] = strings.tileLabels;
  const tiles: readonly { id: string; category: Category; label: string }[] = [
    { id: 'tile-1', category: 'image', label: img1 },
    { id: 'tile-2', category: 'image', label: img2 },
    { id: 'tile-3', category: 'image', label: img3 },
    { id: 'tile-4', category: 'video', label: vid1 },
    { id: 'tile-5', category: 'video', label: vid2 },
    { id: 'tile-6', category: 'video', label: vid3 },
    { id: 'tile-7', category: 'audio', label: aud1 },
    { id: 'tile-8', category: 'audio', label: aud2 },
  ];
  const items: FilterGalleryItem[] = tiles.map(({ id, category, label }) => ({
    id,
    categories: [category],
    node: (
      <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface p-4 text-fg-muted">
        <CategoryIcon category={category} title={label} />
        <span className="text-xs font-medium text-fg">{label}</span>
      </div>
    ),
  }));

  return (
    <figure className="flex flex-col gap-2">
      <FilterGallery
        items={items}
        categories={[
          { id: 'image', label: strings.categoryLabels.image },
          { id: 'video', label: strings.categoryLabels.video },
          { id: 'audio', label: strings.categoryLabels.audio },
        ]}
        allLabel={strings.allLabel}
        label={strings.label}
      />
      <figcaption className="text-sm text-fg-muted">{strings.caption}</figcaption>
    </figure>
  );
}
