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
  it('el selector de layout cambia la disposición de la galería', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const grid = screen.getByRole('list', { name: labels.filterLabel });
    expect(grid).toHaveAttribute('data-layout', 'grid');

    const masonryButton = screen.getByRole('button', { name: labels.layouts.masonry });
    expect(masonryButton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(masonryButton);

    expect(grid).toHaveAttribute('data-layout', 'masonry');
    expect(masonryButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('la búsqueda por modelo restringe el grid', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'seedream' },
    });
    const grid = screen.getByRole('list', { name: labels.filterLabel });
    expect(within(grid).getAllByRole('listitem')).toHaveLength(4); // 4 imágenes Seedream
  });

  it('búsqueda sin resultados muestra el empty state', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText(labels.emptyState)).toBeInTheDocument();
  });

  it('hover del botón fullscreen precarga la variante HD', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    const button = screen.getAllByRole('button', { name: /Pantalla completa/ })[0]!;
    fireEvent.pointerEnter(button);
    expect(preloadFullSources).toHaveBeenCalledWith([
      expect.objectContaining({ fullSrc: expect.stringContaining('-hd.webp') }),
    ]);
  });

  it('el botón fullscreen abre el lightbox con el ítem', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    fireEvent.click(screen.getAllByRole('button', { name: /Pantalla completa/ })[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('categoría activa + búsqueda sin coincidencias en esa categoría muestra el empty state (fix review T11)', () => {
    render(<GalleryDemo locale="es" labels={labels} />);
    // Seedream son solo imágenes: filtrar por Audio + buscar "seedream" da 0 resultados
    // combinados, aunque la búsqueda por sí sola (sin filtro de categoría) sí tendría 4.
    fireEvent.click(screen.getByRole('button', { name: labels.categories.audio }));
    fireEvent.change(screen.getByRole('searchbox', { name: labels.searchLabel }), {
      target: { value: 'seedream' },
    });
    expect(screen.getByText(labels.emptyState)).toBeInTheDocument();
  });

  it('el lightbox de audio agrupa carátula y player en un contenedor propio en columna (fix review T11)', () => {
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
