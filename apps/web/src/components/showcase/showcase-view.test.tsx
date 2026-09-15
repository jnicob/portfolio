import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('selecting a section in the index shows only that section and announces it', () => {
    renderView();
    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByRole('option', { name: /card/i }));
    expect(screen.queryByLabelText('Button')).toBeNull();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/card/i);
  });

  it('the "Todas" option restores everything', () => {
    renderView();
    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByRole('option', { name: /card/i }));
    fireEvent.click(within(listbox).getByRole('option', { name: /todas/i }));
    expect(screen.getByLabelText('Button')).toBeInTheDocument();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(LABELS.showingAll);
  });

  it('refleja el filtro en el hash de la URL para deep-linking', () => {
    renderView();
    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByRole('option', { name: /card/i }));
    expect(window.location.hash).toBe('#card');

    fireEvent.click(within(listbox).getByRole('option', { name: /todas/i }));
    expect(window.location.hash).toBe('');
  });

  // Regression (code review F3.6/replaceState): clearing the filter called
  // `replaceState(null, '', window.location.pathname)`, perdiendo cualquier query
  // string existente (p.ej. `?utm_source=...`) al volver a "Todas".
  it('al restaurar "Todas", conserva el query string de la URL (no solo el pathname)', () => {
    window.history.pushState({}, '', '/es/showcase?foo=bar');
    renderView();
    const listbox = screen.getByRole('listbox');

    fireEvent.click(within(listbox).getByRole('option', { name: /card/i }));
    expect(window.location.hash).toBe('#card');

    fireEvent.click(within(listbox).getByRole('option', { name: /todas/i }));
    expect(window.location.hash).toBe('');
    expect(window.location.search).toBe('?foo=bar');
    expect(window.location.pathname).toBe('/es/showcase');
  });

  it('filters by that section when mounting with an existing hash (deep-link)', () => {
    window.location.hash = '#card';
    renderView();
    expect(screen.queryByLabelText('Button')).toBeNull();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
  });

  // Regression (design review F3.6/I2): the index <nav> had `hidden lg:block`,
  // so on <lg (mobile/tablet) there was no way to filter or reach the
  // deep-links por hash — la feature estrella de la fase. jsdom no aplica Tailwind
  // (there is no real CSS), so the test anchors the contract to the classes of the
  // elemento: nunca debe llevar `hidden` (visible en todo breakpoint); `lg:` es lo
  // only one that changes layout (sticky/column) above that breakpoint.
  it('the index/filter never has the "hidden" class: it is visible at all breakpoints', () => {
    const { container } = render(
      <NextIntlClientProvider locale="es" messages={{}}>
        <ShowcaseView toc={TOC} labels={LABELS} sections={SECTIONS} />
      </NextIntlClientProvider>,
    );
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.className.split(/\s+/)).not.toContain('hidden');
  });

  it('el filtro sigue siendo operable en el DOM aunque el layout de <lg lo coloque encima del contenido', () => {
    renderView();
    // Without any "hidden" class blocking it, the index listbox is reachable
    // y operable independientemente del breakpoint (jsdom no mide layout real).
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    fireEvent.click(within(listbox).getByRole('option', { name: /card/i }));
    expect(screen.queryByLabelText('Button')).toBeNull();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
  });
});

// Regression: FORMATTING_ERROR in console + status text showing the raw key
// ("showcase.index.showing") en vez de "Mostrando: {section}" — visto en /es/showcase
// (normal load and hash deep-link) during F3.6. Root cause: `buildShowcaseViewLabels`
// (used by `page.tsx`) read `index.showing` with `t()` instead of `t.raw()`; that message
// has the literal `{section}` placeholder that `ShowcaseView` interpolates manually later
// (see above), and next-intl requires the argument as soon as `t()` is called — which here does not
// exist yet. It is tested against the real messages (es/en) to pin the contract.
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

  it.each([['es', 'Mostrando: {section}'] as const, ['en', 'Showing: {section}'] as const])(
    'expone el patrón crudo con {section} en %s, sin FORMATTING_ERROR',
    (locale, expectedPattern) => {
      const onError = vi.fn();
      renderProbe(locale, onError);
      expect(screen.getByTestId('showing')).toHaveTextContent(expectedPattern);
      expect(onError).not.toHaveBeenCalled();
    },
  );
});
