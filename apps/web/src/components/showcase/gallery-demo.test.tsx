import { preloadFullSources } from '@nicobehm/media-kit';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryDemo, type GalleryDemoLabels } from './gallery-demo';

// Mock parcial: solo `preloadFullSources` se sustituye por un spy (para poder
// aserto sobre sus llamadas); el resto del paquete (FilterGallery, HoverVideo,
// MediaLightbox…) se usa real, tal como pide el brief.
vi.mock('@nicobehm/media-kit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nicobehm/media-kit')>();
  return { ...actual, preloadFullSources: vi.fn() };
});

const labels: GalleryDemoLabels = {
  filterLabel: 'Categorías de la galería',
  allLabel: 'Todos',
  categories: { image: 'Imagen', video: 'Vídeo', audio: 'Audio' },
  layouts: {
    label: 'Disposición de la galería',
    grid: 'Cuadrícula',
    masonry: 'Masonry',
    justified: 'Filas justificadas',
  },
  searchLabel: 'Buscar en la galería',
  searchPlaceholder: 'Buscar por modelo o título…',
  emptyState: 'No se encontraron resultados.',
  fullscreen: 'Pantalla completa: {title}',
  audio: { play: 'Reproducir {title}', pause: 'Pausar {title}' },
  lightbox: {
    controls: 'Controles',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    zoomLevel: 'Zoom {percent}%',
    reset: 'Restablecer vista',
    fit: 'Ajuste: {current}. Cambiar a {next}',
    fullscreen: 'Entrar en pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    hideControls: 'Ocultar controles',
    showControls: 'Mostrar controles',
    close: 'Cerrar',
    help: 'Atajos de teclado',
    helpTitle: 'Atajos de teclado',
    shortcutZoom: 'Acercar / alejar',
    shortcutReset: 'Restablecer vista',
    shortcutPanKeys: 'Desplazar',
    shortcutPanDrag: 'Mantén Espacio y arrastra para desplazar',
    shortcutFit: 'Cambiar modo de ajuste (barra)',
    shortcutFullscreen: 'Alternar pantalla completa',
    shortcutControls: 'Mostrar / ocultar controles',
    shortcutHelp: 'Alternar esta ayuda',
    shortcutClose: 'Cerrar',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GalleryDemo', () => {
  it('masonry is the initial layout and the selector allows switching to grid', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const grid = screen.getByRole('list', { name: labels.filterLabel });
    expect(grid).toHaveAttribute('data-layout', 'masonry');

    const masonryButton = screen.getByRole('button', { name: labels.layouts.masonry });
    expect(masonryButton).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: labels.layouts.grid }));

    expect(grid).toHaveAttribute('data-layout', 'grid');
    expect(masonryButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('grid uses uniform visual boxes and cover for image, video, and audio', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.click(screen.getByRole('button', { name: labels.layouts.grid }));
    const grid = screen.getByRole('list', { name: labels.filterLabel });
    const tiles = within(grid).getAllByRole('listitem');
    const image = tiles[0]!.querySelector('img');
    const video = tiles.find((tile) => tile.querySelector('.mk-hover-video'));
    const audio = tiles.find((tile) =>
      tile.querySelector('button[aria-label^="Reproducir Google Lyria"]'),
    );

    expect(image).toHaveClass('aspect-square', 'object-cover');
    expect(video?.querySelector('.mk-hover-video')).toHaveClass('aspect-square');
    expect(video?.querySelector('.mk-hover-video img')).toHaveClass('object-cover');
    expect(audio?.querySelector('figure > div')).toHaveClass('aspect-square');
    expect(audio?.querySelector('figure > div > img')).toHaveClass('object-cover');
  });

  it('shares the pill visual language and active fill of the filters', () => {
    render(<GalleryDemo locale="es" labels={labels} />);

    const gridButton = screen.getByRole('button', { name: labels.layouts.grid });
    expect(gridButton.className).toContain('rounded-full');
    expect(gridButton.className).toContain('bg-(--mk-filter-bg)');
    expect(gridButton.className).toContain('aria-pressed:bg-accent');
    expect(gridButton.className).toContain('aria-pressed:text-accent-fg');
  });

  it('search by model restricts the grid', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'seedream' },
    });
    const grid = screen.getByRole('list', { name: labels.filterLabel });
    expect(within(grid).getAllByRole('listitem')).toHaveLength(4); // 4 Seedream images
  });

  it('search with no results shows the empty state', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText(labels.emptyState)).toBeInTheDocument();
  });

  it('fullscreen button hover preloads the HD variant', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const button = screen.getAllByRole('button', { name: /Pantalla completa/ })[0]!;
    fireEvent.pointerEnter(button);
    expect(preloadFullSources).toHaveBeenCalledWith([
      expect.objectContaining({ fullSrc: expect.stringContaining('-hd.webp') }),
    ]);
  });

  it('the fullscreen button opens the lightbox with the item', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.click(screen.getAllByRole('button', { name: /Pantalla completa/ })[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('el fullscreen de imagen arranca en cover y usa siempre la variante HD', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.click(screen.getAllByRole('button', { name: /Pantalla completa/ })[0]!);

    expect(screen.getByRole('dialog')).toHaveAttribute('data-fit', 'cover');
    expect(screen.getByRole('img', { name: /Google NBP/ })).toHaveAttribute(
      'src',
      expect.stringContaining('-hd.webp'),
    );
  });

  it('video fullscreen preserves the contain fit', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const videoButton = screen
      .getAllByRole('button', { name: /Pantalla completa/ })
      .find((button) => button.getAttribute('aria-label')?.includes('Google Veo'));
    expect(videoButton).toBeDefined();
    fireEvent.click(videoButton!);

    expect(screen.getByRole('dialog')).toHaveAttribute('data-fit', 'contain');
  });

  it('active category + search with no matches in that category shows the empty state (fix review T11)', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    // Seedream are images only: filtering by Audio + searching "seedream" yields 0 results
    // combined, even though the search on its own (without category filter) would have 4.
    fireEvent.click(screen.getByRole('button', { name: labels.categories.audio }));
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'seedream' },
    });
    expect(screen.getByText(labels.emptyState)).toBeInTheDocument();
  });

  it('the audio lightbox groups cover and player in its own column container (fix review T11)', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const audioButton = screen
      .getAllByRole('button', { name: /Pantalla completa/ })
      .find((button) => button.getAttribute('aria-label')?.includes('Lyria'));
    expect(audioButton).toBeDefined();
    fireEvent.click(audioButton!);
    const content = screen.getByTestId('audio-lightbox-content');
    expect(content).toHaveClass('flex-col');
    expect(content.querySelector('img')).toBeInTheDocument();
    expect(within(content).getByRole('button', { name: /Reproducir/ })).toBeInTheDocument();
  });
});
