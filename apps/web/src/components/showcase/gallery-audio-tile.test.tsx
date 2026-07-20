import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GalleryAudioTile } from './gallery-audio-tile';

const baseProps = {
  cover: '/c.webp',
  src: '/a.mp3',
  width: 1200,
  height: 1200,
  labels: { play: 'Reproducir Lo-fi', pause: 'Pausar Lo-fi' },
};

describe('GalleryAudioTile', () => {
  it('no monta el audio hasta el primer play (facade)', () => {
    render(<GalleryAudioTile {...baseProps} />);
    expect(document.querySelector('audio')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
    expect(document.querySelector('audio')).toBeInTheDocument();
  });

  it('alterna aria-label y play/pause', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    render(<GalleryAudioTile {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
    expect(playSpy).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar Lo-fi' }));
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('renderiza la carátula como <img loading="lazy"> con las dimensiones dadas', () => {
    const { container } = render(<GalleryAudioTile {...baseProps} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/c.webp');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('width', '1200');
    expect(img).toHaveAttribute('height', '1200');
  });

  it('la barra de progreso arranca en 0% y es aria-hidden', () => {
    const { container } = render(<GalleryAudioTile {...baseProps} />);
    const bar = container.querySelector('[data-testid="audio-progress-fill"]');
    expect(bar).toHaveStyle({ width: '0%' });
    expect(bar?.closest('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('actualiza el ancho de la barra de progreso con timeupdate del <audio>', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const { container } = render(<GalleryAudioTile {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
    const audio = container.querySelector('audio') as HTMLAudioElement;
    Object.defineProperty(audio, 'duration', { value: 10, configurable: true });
    Object.defineProperty(audio, 'currentTime', { value: 5, configurable: true });
    fireEvent.timeUpdate(audio);
    const bar = container.querySelector('[data-testid="audio-progress-fill"]');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('al terminar (ended) vuelve a estado play y la barra a 0%', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const { container } = render(<GalleryAudioTile {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
    const audio = container.querySelector('audio') as HTMLAudioElement;
    Object.defineProperty(audio, 'duration', { value: 10, configurable: true });
    Object.defineProperty(audio, 'currentTime', { value: 10, configurable: true });
    fireEvent.timeUpdate(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole('button', { name: 'Reproducir Lo-fi' })).toBeInTheDocument();
    const bar = container.querySelector('[data-testid="audio-progress-fill"]');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('sincroniza el estado si el audio se pausa o reanuda desde fuera', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    render(<GalleryAudioTile {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: baseProps.labels.play }));
    const audio = document.querySelector('audio') as HTMLAudioElement;

    fireEvent.pause(audio);
    expect(screen.getByRole('button', { name: baseProps.labels.play })).toBeInTheDocument();

    fireEvent.play(audio);
    expect(screen.getByRole('button', { name: baseProps.labels.pause })).toBeInTheDocument();
  });

  describe('hideCover (fix design review T25 I1: lightbox de audio desbordaba el viewport)', () => {
    it('no renderiza la <img> de carátula', () => {
      const { container } = render(<GalleryAudioTile {...baseProps} hideCover />);
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('los controles play/pause siguen operativos', () => {
      const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
      const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
      render(<GalleryAudioTile {...baseProps} hideCover />);
      fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
      expect(playSpy).toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Pausar Lo-fi' }));
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('la barra de progreso sigue actualizándose con timeupdate', () => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
      const { container } = render(<GalleryAudioTile {...baseProps} hideCover />);
      fireEvent.click(screen.getByRole('button', { name: 'Reproducir Lo-fi' }));
      const audio = container.querySelector('audio') as HTMLAudioElement;
      Object.defineProperty(audio, 'duration', { value: 10, configurable: true });
      Object.defineProperty(audio, 'currentTime', { value: 5, configurable: true });
      fireEvent.timeUpdate(audio);
      const bar = container.querySelector('[data-testid="audio-progress-fill"]');
      expect(bar).toHaveStyle({ width: '50%' });
    });
  });
});
