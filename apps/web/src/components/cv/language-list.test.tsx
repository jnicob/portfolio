import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { languages } from '@/data/languages';
import { LanguageList } from './language-list';

describe('LanguageList', () => {
  it('renders all language entries in Spanish', () => {
    render(<LanguageList languages={languages} locale="es" />);
    expect(screen.getByText('Español:')).toBeInTheDocument();
    expect(screen.getByText('Nativo')).toBeInTheDocument();
    expect(screen.getByText('Inglés:')).toBeInTheDocument();
    expect(screen.getByText('B2 Upper Intermediate')).toBeInTheDocument();
  });

  it('renders all language entries in English', () => {
    render(<LanguageList languages={languages} locale="en" />);
    expect(screen.getByText('Spanish:')).toBeInTheDocument();
    expect(screen.getByText('Native')).toBeInTheDocument();
    expect(screen.getByText('English:')).toBeInTheDocument();
    expect(screen.getByText('B2 Upper Intermediate')).toBeInTheDocument();
  });
});
