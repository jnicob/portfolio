import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProfileSummary as ProfileSummaryData } from '@/data/schemas';
import { ProfileSummary, CoreTechGrid } from './profile-summary';

const sampleSummary: ProfileSummaryData = {
  paragraphs: {
    es: [
      'Ingeniero en Informática con más de 15 años de experiencia.',
      'Aplico e integro activamente flujos de trabajo con Agentes de IA.',
    ],
    en: [
      'Computer Engineer with 15+ years of experience.',
      'Actively integrating AI Agent workflows.',
    ],
  },
  coreTechTitle: {
    es: 'Core Tech & Dominio:',
    en: 'Core Tech & Expertise:',
  },
  coreTechBullets: [
    {
      label: { es: 'Lenguajes & Frameworks', en: 'Languages & Frameworks' },
      value: { es: 'TypeScript, JavaScript, Node.js.', en: 'TypeScript, JavaScript, Node.js.' },
    },
    {
      label: { es: 'AI & API Platform', en: 'AI & API Platform' },
      value: { es: 'API Gateways, Claude, Codex.', en: 'API Gateways, Claude, Codex.' },
    },
  ],
};

describe('ProfileSummary', () => {
  it('renderiza párrafos narrativos, título de sección en negrita y viñetas estructuradas', () => {
    render(<ProfileSummary summary={sampleSummary} locale="es" variant="hero" />);

    expect(screen.getByText(/Ingeniero en Informática/)).toBeInTheDocument();
    expect(screen.getByText(/Aplico e integro/)).toBeInTheDocument();

    const titleHeading = screen.getByRole('heading', { level: 3 });
    expect(titleHeading).toHaveTextContent('Core Tech & Dominio:');
    expect(titleHeading).toHaveClass('font-semibold');

    expect(screen.getByText('Lenguajes & Frameworks:')).toHaveClass('font-semibold');
    expect(screen.getByText(/TypeScript, JavaScript, Node.js/)).toBeInTheDocument();
  });

  it('aplica clases específicas de variante hero (más compacto en viñetas)', () => {
    const { container } = render(
      <ProfileSummary summary={sampleSummary} locale="es" variant="hero" />,
    );

    const bulletList = container.querySelector('ul');
    expect(bulletList).toHaveClass('text-sm');
  });

  it('omits core tech bullets when showCoreTech is false', () => {
    render(<ProfileSummary summary={sampleSummary} locale="es" showCoreTech={false} />);

    expect(screen.getByText(/Ingeniero en Informática/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByText('Lenguajes & Frameworks:')).not.toBeInTheDocument();
  });
});

describe('CoreTechGrid', () => {
  it('renders section title and tech cards with categories and badges', () => {
    render(<CoreTechGrid summary={sampleSummary} locale="es" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Core Tech & Dominio');
    expect(screen.getByText('Lenguajes & Frameworks')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(/TypeScript, JavaScript, Node.js/)).toBeInTheDocument();

    expect(screen.getByText('AI & API Platform')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });
});
