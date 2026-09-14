import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { beyondCode } from '@/data/beyond-code';
import { BeyondCodeGallery } from './beyond-code-gallery';

describe('BeyondCodeGallery', () => {
  it('renders the initial photo and counter badge', () => {
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const [firstImage] = beyondCode.images;
    expect(firstImage).toBeDefined();
    if (!firstImage) return;

    const firstImg = screen.getByRole('img', { name: firstImage.alt.es });
    expect(firstImg).toBeInTheDocument();
    expect(firstImg).toHaveAttribute('src', firstImage.src);
    expect(screen.getByText(`1 / ${beyondCode.images.length}`)).toBeInTheDocument();
    if (firstImage.caption) {
      expect(screen.getByText(firstImage.caption.es)).toBeInTheDocument();
    }
  });

  it('advances to the next photo when clicking the Next button', async () => {
    const user = userEvent.setup();
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const nextBtn = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextBtn);

    expect(screen.getByText(`2 / ${beyondCode.images.length}`)).toBeInTheDocument();
    const secondImage = beyondCode.images[1];
    expect(secondImage).toBeDefined();
    if (!secondImage) return;

    const secondImg = screen.getByRole('img', { name: secondImage.alt.es });
    expect(secondImg).toBeInTheDocument();
  });

  it('navigates to the previous photo or wraps around to the last photo', async () => {
    const user = userEvent.setup();
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    await user.click(prevBtn);

    const lastIndex = beyondCode.images.length - 1;
    const lastImage = beyondCode.images[lastIndex];
    expect(lastImage).toBeDefined();
    if (!lastImage) return;

    expect(
      screen.getByText(`${beyondCode.images.length} / ${beyondCode.images.length}`),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: lastImage.alt.es })).toBeInTheDocument();
  });

  it('allows jumping directly to a slide using pagination dot indicators', async () => {
    const user = userEvent.setup();
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const dot3 = screen.getByRole('button', { name: /ir a la foto 3/i });
    await user.click(dot3);

    expect(screen.getByText(`3 / ${beyondCode.images.length}`)).toBeInTheDocument();
    const thirdImage = beyondCode.images[2];
    expect(thirdImage).toBeDefined();
    if (!thirdImage) return;

    expect(screen.getByRole('img', { name: thirdImage.alt.es })).toBeInTheDocument();
  });

  it('supports keyboard navigation via ArrowRight and ArrowLeft keys', async () => {
    const user = userEvent.setup();
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const gallery = screen.getByRole('region', { name: /galería personal/i });
    gallery.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(`2 / ${beyondCode.images.length}`)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(`1 / ${beyondCode.images.length}`)).toBeInTheDocument();
  });

  it('supports drag panning gestures with grab/grabbing cursor and advances slide', () => {
    render(<BeyondCodeGallery images={beyondCode.images} locale="es" />);

    const viewport = screen.getByTestId('gallery-viewport');
    expect(viewport).toHaveClass('cursor-grab');

    // Drag to the left (swipe/pan to next photo)
    fireEvent.pointerDown(viewport, { button: 0, clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(viewport, { clientX: 200, pointerId: 1 });
    fireEvent.pointerUp(viewport, { pointerId: 1 });

    expect(screen.getByText(`2 / ${beyondCode.images.length}`)).toBeInTheDocument();

    // Drag to the right (swipe/pan to previous photo)
    fireEvent.pointerDown(viewport, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(viewport, { clientX: 200, pointerId: 1 });
    fireEvent.pointerUp(viewport, { pointerId: 1 });

    expect(screen.getByText(`1 / ${beyondCode.images.length}`)).toBeInTheDocument();
  });
});
