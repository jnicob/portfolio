import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoScrubDemo, type VideoScrubDemoStrings } from './video-scrub-demo';

const strings: VideoScrubDemoStrings = {
  label: 'Scrub preview of a short clip',
  hint: 'Move the pointer to scrub the video',
  caption: 'VideoScrubPreview demo caption',
};

describe('VideoScrubDemo', () => {
  it('no monta el <video> (ni descarga el clip) antes de interactuar — muestra el poster como imagen lazy', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    expect(screen.getByLabelText(strings.label)).toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    const poster = container.querySelector('img');
    expect(poster).toHaveAttribute('src', '/demo/scrub-poster.webp');
    expect(poster).toHaveAttribute('loading', 'lazy');
    expect(poster).toHaveAttribute('width', '864');
    expect(poster).toHaveAttribute('height', '486');
  });

  it('monta VideoScrubPreview con el clip real y el poster tras la primera interacción', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    fireEvent.pointerEnter(screen.getByLabelText(strings.label));
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', '/demo/scrub.mp4');
    expect(video).toHaveAttribute('poster', '/demo/scrub-poster.webp');
  });

  it('renders the caption from props', () => {
    render(<VideoScrubDemo strings={strings} />);
    expect(screen.getByText(strings.caption)).toBeInTheDocument();
  });
});

/**
 * Task 26: el diagnóstico en navegador confirmó que el scrub (puntero y
 * teclado) funciona correctamente — el feedback de usuario era de affordance:
 * nada en el vídeo en reposo indicaba que era interactivo. Este hint es
 * decorativo (`aria-hidden`, el texto real vive en `label`/`figcaption`) y
 * debe desaparecer en la primera interacción, sin volver a aparecer.
 */
describe('VideoScrubDemo — hint de affordance', () => {
  it('muestra el hint decorativo al montar', () => {
    render(<VideoScrubDemo strings={strings} />);
    const hint = screen.getByText(strings.hint);
    expect(hint).toBeInTheDocument();
    expect(hint.closest('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('oculta el hint cuando el puntero entra en la zona de scrub', () => {
    render(<VideoScrubDemo strings={strings} />);
    fireEvent.pointerEnter(screen.getByLabelText(strings.label));
    expect(screen.queryByText(strings.hint)).not.toBeInTheDocument();
  });

  it('oculta el hint cuando la zona de scrub recibe foco por teclado', () => {
    render(<VideoScrubDemo strings={strings} />);
    fireEvent.focus(screen.getByLabelText(strings.label));
    expect(screen.queryByText(strings.hint)).not.toBeInTheDocument();
  });

  it('no vuelve a mostrar el hint tras salir de la zona', () => {
    render(<VideoScrubDemo strings={strings} />);
    const scrubArea = screen.getByLabelText(strings.label);
    fireEvent.pointerEnter(scrubArea);
    fireEvent.pointerLeave(scrubArea);
    expect(screen.queryByText(strings.hint)).not.toBeInTheDocument();
  });
});

/**
 * Task 27 (perf, F3.6): el placeholder (poster + botón) se desmonta al
 * activarse el widget real — sin reclamar el foco a mano, un usuario de
 * teclado que llega con Tab perdería el foco (se iría a `<body>`) justo en
 * el momento de activar la demo.
 */
describe('VideoScrubDemo — foco tras activación por teclado', () => {
  it('reenvía el foco al widget real cuando la activación viene de foco (teclado)', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    fireEvent.focus(screen.getByLabelText(strings.label));
    const scrubRoot = container.querySelector('[tabindex]');
    expect(scrubRoot).not.toBeNull();
    expect(document.activeElement).toBe(scrubRoot);
  });
});
