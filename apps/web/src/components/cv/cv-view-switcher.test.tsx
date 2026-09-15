import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CvViewSwitcher, type CvViewSwitcherLabels } from './cv-view-switcher';

const LABELS: CvViewSwitcherLabels = {
  groupLabel: 'CV view',
  standard: 'Standard',
  compact: 'Compact',
  timeline: 'Timeline',
};

describe('CvViewSwitcher', () => {
  it('renderiza un radiogroup con 3 opciones y la vista activa marcada', () => {
    render(<CvViewSwitcher view="standard" onChange={vi.fn()} labels={LABELS} />);

    const group = screen.getByRole('radiogroup', { name: LABELS.groupLabel });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Compact' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Timeline' })).not.toBeChecked();
  });

  it('clicking an option calls onChange with the chosen view', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CvViewSwitcher view="standard" onChange={onChange} labels={LABELS} />);

    await user.click(screen.getByRole('radio', { name: 'Compact' }));

    expect(onChange).toHaveBeenCalledWith('compact');
  });

  it('right arrow from the active option moves focus and calls onChange (native radio semantics)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CvViewSwitcher view="standard" onChange={onChange} labels={LABELS} />);

    screen.getByRole('radio', { name: 'Standard' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'Compact' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('compact');
  });

  it('el grupo lleva la clase no-print', () => {
    render(<CvViewSwitcher view="standard" onChange={vi.fn()} labels={LABELS} />);
    expect(screen.getByRole('radiogroup', { name: LABELS.groupLabel })).toHaveClass('no-print');
  });
});
