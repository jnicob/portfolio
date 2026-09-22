import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import { CvHeader } from './cv-header';

describe('CvHeader', () => {
  it('renders name, headline, and public contact links', () => {
    render(<CvHeader locale="es" />);

    const expectedName = profile.fullName ? profile.fullName.es : profile.name;
    expect(screen.getByRole('heading', { level: 1, name: expectedName })).toBeInTheDocument();
    expect(screen.getByText(profile.headline.es)).toBeInTheDocument();
    if (profile.links.website) {
      expect(screen.getByRole('link', { name: profile.links.website })).toHaveAttribute(
        'href',
        profile.links.website,
      );
    }
    expect(screen.getByRole('link', { name: profile.links.github })).toHaveAttribute(
      'href',
      profile.links.github,
    );
    expect(screen.getByRole('link', { name: profile.links.linkedin })).toHaveAttribute(
      'href',
      profile.links.linkedin,
    );
    expect(screen.getByText(profile.location.es)).toBeInTheDocument();
  });

  it('displays professional brief by default and toggles visibility on click', async () => {
    const user = userEvent.setup();
    render(
      <CvHeader locale="es" showBriefLabel="Mostrar resumen" hideBriefLabel="Ocultar resumen" />,
    );

    // Visible initially
    const toggleButton = screen.getByRole('button', { name: 'Ocultar resumen' });
    expect(toggleButton).toBeInTheDocument();
    const summarySample = profile.summary.paragraphs.es[0] ?? '';
    expect(
      screen.getByText((content) => content.includes(summarySample.slice(0, 30))),
    ).toBeInTheDocument();

    // Toggle off
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: 'Mostrar resumen' })).toBeInTheDocument();
  });

  it('hides profile photo by default and toggles on/off when clicked', async () => {
    const user = userEvent.setup();
    render(
      <CvHeader
        locale="es"
        showPhotoLabel="Incluir foto"
        hidePhotoLabel="Quitar foto"
        photoSrc="/profile/avatar-cv.jpg"
      />,
    );

    // Off by default
    expect(screen.queryByTestId('cv-photo')).not.toBeInTheDocument();
    const photoToggle = screen.getByRole('button', { name: 'Incluir foto' });
    expect(photoToggle).toBeInTheDocument();

    // Toggle on
    await user.click(photoToggle);
    expect(screen.getByTestId('cv-photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar foto' })).toBeInTheDocument();

    // Toggle off again
    await user.click(screen.getByRole('button', { name: 'Quitar foto' }));
    expect(screen.queryByTestId('cv-photo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Incluir foto' })).toBeInTheDocument();
  });

  it('preserves photo visibility when changing locale / remounting', async () => {
    localStorage.clear();
    const user = userEvent.setup();
    const { unmount } = render(
      <CvHeader
        locale="es"
        showPhotoLabel="Incluir foto"
        hidePhotoLabel="Quitar foto"
        photoSrc="/profile/avatar-cv.jpg"
      />,
    );

    expect(screen.queryByTestId('cv-photo')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Incluir foto' }));
    expect(screen.getByTestId('cv-photo')).toBeInTheDocument();

    // Switch locale to English
    unmount();
    render(
      <CvHeader
        locale="en"
        showPhotoLabel="Include photo"
        hidePhotoLabel="Remove photo"
        photoSrc="/profile/avatar-cv.jpg"
      />,
    );

    expect(screen.getByTestId('cv-photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove photo' })).toBeInTheDocument();
  });
});
