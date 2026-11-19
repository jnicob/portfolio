import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import { CvHeader } from './cv-header';

describe('CvHeader', () => {
  it('renders name, headline, and places location with shortened public links when no private contact is present', () => {
    render(<CvHeader locale="es" />);

    const expectedName = profile.fullName ? profile.fullName.es : profile.name;
    const heading = screen.getByRole('heading', { level: 1, name: expectedName });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(profile.headline.es)).toBeInTheDocument();
    expect(heading.parentElement).not.toHaveTextContent(profile.location.es);
    const contactColumn = screen.getByTestId('cv-contact-column');
    expect(contactColumn).toHaveTextContent(profile.location.es);
    if (profile.links.website) {
      expect(screen.getByRole('link', { name: 'jnicob.dev' })).toHaveAttribute(
        'href',
        profile.links.website,
      );
    }
    expect(screen.getByRole('link', { name: 'github.com/jnicob' })).toHaveAttribute(
      'href',
      profile.links.github,
    );
    expect(screen.getByRole('link', { name: 'linkedin.com/in/nicobehm' })).toHaveAttribute(
      'href',
      profile.links.linkedin,
    );
    expect(screen.queryByRole('link', { name: /@/ })).not.toBeInTheDocument();
  });

  it('renders private email/phone in contact column and moves location under headline when provided', () => {
    render(
      <CvHeader
        locale="en"
        privateContact={{ email: 'contact@example.com', phone: '+34 600 000 000' }}
      />,
    );

    const expectedName = profile.fullName ? profile.fullName.en : profile.name;
    const heading = screen.getByRole('heading', { level: 1, name: expectedName });
    const contactColumn = screen.getByTestId('cv-contact-column');
    expect(heading.parentElement).toHaveTextContent(profile.location.en);
    expect(contactColumn).not.toHaveTextContent(profile.location.en);
    expect(screen.getByRole('link', { name: 'contact@example.com' })).toHaveAttribute(
      'href',
      'mailto:contact@example.com',
    );
    expect(screen.getByRole('link', { name: '+34 600 000 000' })).toHaveAttribute(
      'href',
      'tel:+34600000000',
    );
  });

  it('always displays the professional brief without a hide-summary toggle', () => {
    render(<CvHeader locale="es" />);

    const summarySample = profile.summary.paragraphs.es[0] ?? '';
    expect(
      screen.getByText((content) => content.includes(summarySample.slice(0, 30))),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resumen|summary/i })).not.toBeInTheDocument();
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
        showPhotoLabel="Show photo"
        hidePhotoLabel="Hide photo"
        photoSrc="/profile/avatar-cv.jpg"
      />,
    );

    expect(screen.getByTestId('cv-photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide photo' })).toBeInTheDocument();
  });
});
