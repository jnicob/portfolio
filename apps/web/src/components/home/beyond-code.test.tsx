import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { beyondCode } from '@/data/beyond-code';
import { BeyondCodeSection } from './beyond-code';

describe('BeyondCodeSection', () => {
  it('renders personal and professional information in Spanish', () => {
    render(<BeyondCodeSection locale="es" />);

    expect(
      screen.getByRole('heading', { level: 2, name: beyondCode.title.es }),
    ).toBeInTheDocument();
    expect(screen.getByText(beyondCode.subtitle.es)).toBeInTheDocument();
    expect(screen.getByText(beyondCode.location.es)).toBeInTheDocument();
    expect(screen.getByText(beyondCode.origin.es)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: beyondCode.interestsTitle.es }),
    ).toBeInTheDocument();
    expect(screen.getByText(beyondCode.makerDescription.es)).toBeInTheDocument();
    expect(screen.getByText(beyondCode.philosophyDescription.es)).toBeInTheDocument();

    const [firstImage] = beyondCode.images;
    expect(firstImage).toBeDefined();
    if (!firstImage) return;

    const img = screen.getByRole('img', { name: firstImage.alt.es });
    expect(img).toHaveAttribute('src', firstImage.src);
  });

  it('renders correctly in English', () => {
    render(<BeyondCodeSection locale="en" />);

    expect(
      screen.getByRole('heading', { level: 2, name: beyondCode.title.en }),
    ).toBeInTheDocument();
    expect(screen.getByText(beyondCode.subtitle.en)).toBeInTheDocument();
    expect(screen.getByText(beyondCode.location.en)).toBeInTheDocument();
    expect(screen.getByText(beyondCode.origin.en)).toBeInTheDocument();

    const [firstImage] = beyondCode.images;
    expect(firstImage).toBeDefined();
    if (!firstImage) return;

    const img = screen.getByRole('img', { name: firstImage.alt.en });
    expect(img).toHaveAttribute('src', firstImage.src);
  });
});
