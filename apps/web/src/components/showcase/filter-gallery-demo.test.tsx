import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FilterGalleryDemo, type FilterGalleryDemoStrings } from './filter-gallery-demo';

const strings: FilterGalleryDemoStrings = {
  label: 'Media categories',
  allLabel: 'All',
  categoryLabels: { image: 'Image', video: 'Video', audio: 'Audio' },
  tileLabels: ['Photo 1', 'Photo 2', 'Photo 3', 'Clip 1', 'Clip 2', 'Clip 3', 'Track 1', 'Track 2'],
  caption: 'FilterGallery demo caption',
};

function renderDemo() {
  return render(<FilterGalleryDemo strings={strings} />);
}

describe('FilterGalleryDemo', () => {
  it('renders 8 tiles, each an accessible SVG icon named from props', () => {
    renderDemo();
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    for (const label of strings.tileLabels) {
      expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
    }
  });

  it('filters down to the 3 video tiles when the "Video" toggle is pressed', async () => {
    const user = userEvent.setup();
    renderDemo();
    await user.click(screen.getByRole('button', { name: strings.categoryLabels.video }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('img', { name: strings.tileLabels[3] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.categoryLabels.video })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('restores all 8 tiles when "All" is pressed again', async () => {
    const user = userEvent.setup();
    renderDemo();
    await user.click(screen.getByRole('button', { name: strings.categoryLabels.audio }));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: strings.allLabel }));
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
  });

  it('renders the caption from props', () => {
    renderDemo();
    expect(screen.getByText(strings.caption)).toBeInTheDocument();
  });
});
