import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoScrubDemo, type VideoScrubDemoStrings } from './video-scrub-demo';

const strings: VideoScrubDemoStrings = {
  label: 'Scrub preview of a short clip',
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
