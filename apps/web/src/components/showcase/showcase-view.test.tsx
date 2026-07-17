import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShowcaseView, type ShowcaseSection, type ShowcaseViewLabels } from './showcase-view';
import { buildShowcaseViewLabels } from './showcase-view-labels';
import esMessages from '../../../messages/es.json';
import enMessages from '../../../messages/en.json';

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

// Regresión: FORMATTING_ERROR en consola + texto de estado mostrando la key cruda
// ("showcase.index.showing") en vez de "Mostrando: {section}" — visto en /es/showcase
// (carga normal y deep-link por hash) durante F3.6. Causa raíz: `buildShowcaseViewLabels`
// (usada por `page.tsx`) leía `index.showing` con `t()` en vez de `t.raw()`; ese mensaje
// trae el placeholder literal `{section}` que `ShowcaseView` interpola a mano más tarde
// (ver arriba), y next-intl exige el argumento en cuanto se llama `t()` — que aquí no
// existe todavía. Se prueba contra los mensajes reales (es/en) para pinnear el contrato.
describe('buildShowcaseViewLabels — contrato de index.showing', () => {
  function LabelsProbe() {
    const t = useTranslations('showcase');
    const labels = buildShowcaseViewLabels(t);
    return <div data-testid="showing">{labels.showing}</div>;
  }

  function renderProbe(locale: 'es' | 'en', onError: (error: unknown) => void) {
    const messages = locale === 'es' ? esMessages : enMessages;
    render(
      <NextIntlClientProvider locale={locale} messages={messages} onError={onError}>
        <LabelsProbe />
      </NextIntlClientProvider>,
    );
  }

  it.each([
    ['es', 'Mostrando: {section}'] as const,
    ['en', 'Showing: {section}'] as const,
  ])(
    'expone el patrón crudo con {section} en %s, sin FORMATTING_ERROR',
    (locale, expectedPattern) => {
      const onError = vi.fn();
      renderProbe(locale, onError);
      expect(screen.getByTestId('showing')).toHaveTextContent(expectedPattern);
      expect(onError).not.toHaveBeenCalled();
    },
  );
});
