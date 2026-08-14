import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { profile } from '@/data/profile';
import { CvHeader } from './cv-header';

describe('CvHeader', () => {
  it('renderiza el nombre, headline y enlaces de contacto', () => {
    render(<CvHeader locale="es" />);

    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument();
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
  });

  it('muestra el resumen profesional por defecto y permite alternar su visibilidad', async () => {
    const user = userEvent.setup();
    render(
      <CvHeader locale="es" showBriefLabel="Mostrar resumen" hideBriefLabel="Ocultar resumen" />,
    );

    // Visible inicialmente
    const toggleButton = screen.getByRole('button', { name: 'Ocultar resumen' });
    expect(toggleButton).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Perfil de punta a punta')),
    ).toBeInTheDocument();

    // Al hacer click, se oculta
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: 'Mostrar resumen' })).toBeInTheDocument();
  });
});
