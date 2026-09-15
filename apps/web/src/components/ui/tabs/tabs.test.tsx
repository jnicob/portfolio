import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from './tabs';

function renderTabs() {
  return render(
    <Tabs defaultValue="preview">
      <TabList label="Resultado">
        <Tab value="preview">Preview</Tab>
        <Tab value="api">API</Tab>
      </TabList>
      <TabPanel value="preview">panel-preview</TabPanel>
      <TabPanel value="api">panel-api</TabPanel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('marks the active tab and exposes only its panel in the a11y tree', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-preview')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('panel-api')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('cambia con click', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    expect(screen.getByText('panel-api')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('panel-preview')).toHaveAttribute('aria-hidden', 'true');
  });

  it('navega con flechas (roving tabindex, con wrap)', async () => {
    renderTabs();
    screen.getByRole('tab', { name: 'Preview' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveFocus();
  });

  it('only the active tab is tabbable', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('tabindex', '-1');
  });
});

// Contrato actualizado en Fase 3.6 (B2): los paneles pasan de `hidden` (display:none,
// altura 0) a compartir celda de grid con el inactivo en `invisible` (visibility:hidden,
// conserva su caja) — esto es lo que elimina el salto de layout al cambiar de tab, algo
// which the `hidden` of C1/2.6 did not guarantee (different heights → the block shrank).
// Documented contract change, not a regression: both panels remain mounted; the
// inactivo ya no tiene el atributo `hidden`, en su lugar `aria-hidden="true"` + `invisible`
// y sin `tabIndex` (no focusable).
describe('Tabs v3.6 — paneles apilados en grid, sin desplazamiento (B2)', () => {
  it('mantiene ambos paneles montados; ninguno tiene el atributo hidden', () => {
    renderTabs();
    expect(screen.getByText('panel-preview')).not.toHaveAttribute('hidden');
    expect(screen.getByText('panel-api')).not.toHaveAttribute('hidden');
  });

  it('el panel activo: aria-hidden=false, opacity-100 y tabIndex=0', () => {
    renderTabs();
    const preview = screen.getByText('panel-preview');
    expect(preview).toHaveAttribute('aria-hidden', 'false');
    expect(preview).toHaveClass('opacity-100');
    expect(preview).not.toHaveClass('invisible');
    expect(preview).toHaveAttribute('tabindex', '0');
  });

  it('el panel inactivo: aria-hidden=true, invisible y sin tabIndex (no focusable)', () => {
    renderTabs();
    const api = screen.getByText('panel-api');
    expect(api).toHaveAttribute('aria-hidden', 'true');
    expect(api).toHaveClass('invisible');
    expect(api).not.toHaveAttribute('tabindex');
  });

  it('only the active panel is exposed via role=tabpanel (aria-hidden removes it from the a11y tree)', () => {
    renderTabs();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('cambiar de tab alterna el contrato sin desmontar (cero remount → cero layout-shift)', async () => {
    renderTabs();
    const preview = screen.getByText('panel-preview');
    const api = screen.getByText('panel-api');

    await userEvent.click(screen.getByRole('tab', { name: 'API' }));

    // Mismos nodos de antes del click: no se desmontaron.
    expect(api).toHaveAttribute('aria-hidden', 'false');
    expect(api).toHaveClass('opacity-100');
    expect(api).toHaveAttribute('tabindex', '0');

    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview).toHaveClass('invisible');
    expect(preview).not.toHaveAttribute('tabindex');
  });
});

// A3 (feedback de Nico): en Tailwind v4 `<button>` ya no trae `cursor: pointer` por
// default (preflight change compared to v3) — without an explicit class the Tabs did not
// show a pointer or noticeable hover. Phase 3.6 (A2) convention: a control
// muestra `cursor-pointer` si y solo si es interactivo real; el hover reutiliza los
// mismos tokens que Button (ghost/primary, T14) en vez de inventar un estado nuevo.
describe('Tabs — cursor y hover (A2/A3)', () => {
  it('cada trigger es cursor-pointer, sea cual sea su estado', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveClass('cursor-pointer');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveClass('cursor-pointer');
  });

  it('el trigger inactivo tiene hover de fondo perceptible sobre el TabList (bg-surface)', () => {
    renderTabs();
    const inactive = screen.getByRole('tab', { name: 'API' });
    // TabList is already bg-surface; `border` provides clear contrast step.
    expect(inactive).toHaveClass('hover:bg-border');
    expect(inactive).toHaveClass('hover:text-fg');
  });

  it('el trigger activo tiene hover propio, igual que Button primary', () => {
    renderTabs();
    const active = screen.getByRole('tab', { name: 'Preview' });
    expect(active).toHaveClass('hover:bg-accent-hover');
  });
});
