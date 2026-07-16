import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SkinSwitcher, type SkinSwitcherLabels } from './skin-switcher';

const LABELS: SkinSwitcherLabels = {
  button: 'Skin',
  inputLabel: 'Filter skins',
  emptyMessage: 'No skins match',
  skinNames: {
    'dev-tool': 'Dev tool',
    editorial: 'Editorial',
    terminal: 'Terminal',
    vibrant: 'Vibrant',
  },
};

describe('SkinSwitcher', () => {
  afterEach(() => {
    delete document.documentElement.dataset.skin;
    localStorage.clear();
  });

  it('abre con click, mueve el foco al input, filtra por keyword y Enter aplica el skin', async () => {
    const user = userEvent.setup();
    render(<SkinSwitcher labels={LABELS} />);

    const button = screen.getByRole('button', { name: 'Skin' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const combobox = screen.getByRole('combobox', { name: 'Filter skins' });
    expect(combobox).toHaveFocus();

    await user.type(combobox, 'term');
    expect(screen.getByRole('option', { name: 'Terminal' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Editorial' })).not.toBeInTheDocument();

    await user.keyboard('{Enter}');

    expect(document.documentElement.dataset.skin).toBe('terminal');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('seleccionar Dev tool con click elimina data-skin (default sin atributo)', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.skin = 'vibrant';
    render(<SkinSwitcher labels={LABELS} />);

    await user.click(screen.getByRole('button', { name: 'Skin' }));
    await user.click(screen.getByRole('option', { name: 'Dev tool' }));

    expect(document.documentElement.dataset.skin).toBeUndefined();
  });

  it('click fuera del panel lo cierra', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SkinSwitcher labels={LABELS} />
        <button type="button">outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Skin' }));
    expect(screen.getByRole('combobox', { name: 'Filter skins' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside' }));

    expect(screen.queryByRole('combobox', { name: 'Filter skins' })).not.toBeInTheDocument();
  });

  it('Escape con el filtro ya vacío cierra el panel y devuelve el foco al botón', async () => {
    const user = userEvent.setup();
    render(<SkinSwitcher labels={LABELS} />);

    const button = screen.getByRole('button', { name: 'Skin' });
    await user.click(button);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('combobox', { name: 'Filter skins' })).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('muestra cursor pointer en el botón disparador', () => {
    render(<SkinSwitcher labels={LABELS} />);
    expect(screen.getByRole('button', { name: 'Skin' })).toHaveClass('cursor-pointer');
  });

  it('al abrir, la skin actual aparece marcada como seleccionada', () => {
    document.documentElement.dataset.skin = 'terminal';
    render(<SkinSwitcher labels={LABELS} />);
    fireEvent.click(screen.getByRole('button', { name: LABELS.button }));
    const option = screen.getByRole('option', { name: new RegExp(LABELS.skinNames.terminal) });
    expect(option).toHaveAttribute('aria-current', 'true');
    // El resaltado activo (teclado/ratón) debe coincidir con la skin marcada desde
    // el primer render, no solo el aria-current: si selectedSkin llegara tarde
    // (p.ej. via useEffect tras montar FilterableList), aria-activedescendant se
    // quedaría en el primer item de la lista en vez de la skin real.
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', option.id);
  });
});
