import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoScrubDemo, type VideoScrubDemoStrings } from './video-scrub-demo';

const strings: VideoScrubDemoStrings = {
  label: 'Scrub preview of a short clip',
  hint: 'Swipe or use the arrow keys to scrub the video',
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

  it('mounts VideoScrubPreview with the real clip and poster after the first interaction', () => {
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

  it('ocupa el ancho completo de la card — sin cap de ancho estrecho (backlog T21 "ancho scrub")', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    fireEvent.pointerEnter(screen.getByLabelText(strings.label));
    const scrubRoot = container.querySelector('.mk-scrub');
    expect(scrubRoot).not.toBeNull();
    expect(scrubRoot!.closest('[class*="max-w"]')).toBeNull();
  });
});

/**
 * Task 26: in-browser diagnostics confirmed that scrubbing (pointer and
 * keyboard) works correctly — user feedback was about affordance:
 * nothing in the idle video indicated it was interactive. This hint is
 * decorative (`aria-hidden`, the actual text lives in `label`/`figcaption`) and
 * must disappear on first interaction, without reappearing.
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
 * Task 27 (perf, F3.6): the placeholder (poster + button) unmounts when
 * the actual widget activates — without manually reclaiming focus, a
 * keyboard user arriving with Tab would lose focus (it would go to `<body>`) right at
 * the moment of activating the demo.
 */
describe('VideoScrubDemo — foco tras activación por teclado', () => {
  it('forwards focus to the real widget when activation comes from focus (keyboard)', () => {
    const { container } = render(<VideoScrubDemo strings={strings} />);
    fireEvent.focus(screen.getByLabelText(strings.label));
    const scrubRoot = container.querySelector('[tabindex]');
    expect(scrubRoot).not.toBeNull();
    expect(document.activeElement).toBe(scrubRoot);
  });
});
