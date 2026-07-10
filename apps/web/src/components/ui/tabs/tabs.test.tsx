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
  it('marca la pestaña activa y muestra solo su panel', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-preview')).toBeVisible();
    expect(screen.queryByText('panel-api')).not.toBeInTheDocument();
  });

  it('cambia con click', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'API' }));
    expect(screen.getByText('panel-api')).toBeVisible();
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

  it('solo la pestaña activa es tabulable', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'API' })).toHaveAttribute('tabindex', '-1');
  });
});
