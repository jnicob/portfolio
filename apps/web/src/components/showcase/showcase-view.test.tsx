import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShowcaseView, type ShowcaseSection, type ShowcaseViewLabels } from './showcase-view';

const TOC = [
  { id: 'button', label: 'Button' },
  { id: 'card', label: 'Card' },
];

const SECTIONS: ShowcaseSection[] = [
  { id: 'button', node: <section aria-label="Button">B</section> },
  { id: 'card', node: <section aria-label="Card">C</section> },
];

const LABELS: ShowcaseViewLabels = {
  navLabel: 'Índice del showcase',
  inputLabel: 'Filtrar secciones',
  emptyMessage: 'Ninguna sección coincide',
  placeholder: 'Buscar…',
  all: 'Todas',
  showing: 'Mostrando: {section}',
  showingAll: 'Mostrando todas las secciones',
};

function renderView() {
  render(
    <NextIntlClientProvider locale="es" messages={{}}>
      <ShowcaseView toc={TOC} labels={LABELS} sections={SECTIONS} />
    </NextIntlClientProvider>,
  );
}

describe('ShowcaseView', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('por defecto muestra todas las secciones', () => {
    renderView();
    expect(screen.getByLabelText('Button')).toBeInTheDocument();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(LABELS.showingAll);
  });

  it('seleccionar una sección en el índice muestra solo esa y lo anuncia', () => {
    renderView();
    fireEvent.click(screen.getByRole('option', { name: /card/i }));
    expect(screen.queryByLabelText('Button')).toBeNull();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/card/i);
  });

  it('la opción "Todas" restaura todo', () => {
    renderView();
    fireEvent.click(screen.getByRole('option', { name: /card/i }));
    fireEvent.click(screen.getByRole('option', { name: /todas/i }));
    expect(screen.getByLabelText('Button')).toBeInTheDocument();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(LABELS.showingAll);
  });

  it('refleja el filtro en el hash de la URL para deep-linking', () => {
    renderView();
    fireEvent.click(screen.getByRole('option', { name: /card/i }));
    expect(window.location.hash).toBe('#card');

    fireEvent.click(screen.getByRole('option', { name: /todas/i }));
    expect(window.location.hash).toBe('');
  });

  it('al montar con un hash existente, filtra por esa sección (deep-link)', () => {
    window.location.hash = '#card';
    renderView();
    expect(screen.queryByLabelText('Button')).toBeNull();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
  });
});
