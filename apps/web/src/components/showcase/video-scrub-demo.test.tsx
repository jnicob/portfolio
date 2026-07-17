import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoScrubDemo, type VideoScrubDemoStrings } from './video-scrub-demo';

const strings: VideoScrubDemoStrings = {
  label: 'Scrub preview of a short clip',
  hint: 'Move the pointer to scrub the video',
  caption: 'VideoScrubPreview demo caption',
};

describe('VideoScrubDemo', () => {
  it('renders VideoScrubPreview with the real clip source and poster', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    expect(screen.getByLabelText(strings.label)).toBeInTheDocument();
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
