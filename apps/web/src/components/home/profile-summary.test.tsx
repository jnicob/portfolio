import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileSummary } from './profile-summary';

const sampleSummary = `Ingeniero en Informática con más de 15 años de experiencia.

Aplico e integro activamente flujos de trabajo con Agentes de IA.

Core Tech & Dominio:
• Lenguajes & Frameworks: TypeScript, JavaScript, Node.js.
• AI & API Platform: API Gateways, Claude, Codex.
`;

describe('ProfileSummary', () => {
  it('renderiza párrafos narrativos, título de sección en negrita y viñetas estructuradas', () => {
    render(<ProfileSummary summary={sampleSummary} variant="hero" />);

    expect(screen.getByText(/Ingeniero en Informática/)).toBeInTheDocument();
    expect(screen.getByText(/Aplico e integro/)).toBeInTheDocument();

    const titleHeading = screen.getByRole('heading', { level: 3 });
    expect(titleHeading).toHaveTextContent('Core Tech & Dominio:');
    expect(titleHeading).toHaveClass('font-semibold');

    expect(screen.getByText('Lenguajes & Frameworks:')).toHaveClass('font-semibold');
    expect(screen.getByText(/TypeScript, JavaScript, Node.js/)).toBeInTheDocument();
  });

  it('aplica clases específicas de variante hero (más compacto en viñetas)', () => {
    const { container } = render(<ProfileSummary summary={sampleSummary} variant="hero" />);

    const bulletList = container.querySelector('ul');
    expect(bulletList).toHaveClass('text-sm');
  });

  it('aplica clases específicas de variante cv', () => {
    const { container } = render(<ProfileSummary summary={sampleSummary} variant="cv" />);

    const bulletList = container.querySelector('ul');
    expect(bulletList).toHaveClass('text-xs');
  });
});
