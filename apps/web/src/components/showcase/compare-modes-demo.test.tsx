import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CompareModesDemo, type CompareModesDemoStrings } from './compare-modes-demo';

const strings: CompareModesDemoStrings = {
  groupLabel: 'Comparison mode',
  modeLabels: {
    wipe: 'Wipe',
    onion: 'Onion skin',
    blink: 'Blink',
    'side-by-side': 'Side by side',
  },
  beforeAlt: 'Desaturated version of the landscape photo',
  compareLabel: 'Compare before and after (mode switcher)',
  pauseLabel: 'Comparison paused',
  resumeLabel: 'Comparison following pointer',
  caption: 'compareMode demo caption',
};

function renderDemo() {
  return render(<CompareModesDemo strings={strings} />);
}

describe('CompareModesDemo', () => {
  it('renders a button group with a toggle per compare mode, labeled from props', () => {
    renderDemo();
    expect(screen.getByRole('group', { name: strings.groupLabel })).toBeInTheDocument();
    for (const label of Object.values(strings.modeLabels)) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('starts in wipe mode, only that toggle pressed', () => {
    renderDemo();
    expect(screen.getByRole('button', { name: strings.modeLabels.wipe })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: strings.modeLabels.onion })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('switches the slider to onion mode when the Onion toggle is pressed', async () => {
    const user = userEvent.setup();
    const { container } = renderDemo();
    await user.click(screen.getByRole('button', { name: strings.modeLabels.onion }));
    expect(container.querySelector('.mk-compare')).toHaveAttribute('data-compare-mode', 'onion');
    expect(screen.getByRole('button', { name: strings.modeLabels.onion })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('remounts the slider on every mode switch so blink always re-initializes running', async () => {
    const user = userEvent.setup();
    renderDemo();
    await user.click(screen.getByRole('button', { name: strings.modeLabels.blink }));
    const blinkSwitch = screen.getByRole('switch');
    expect(blinkSwitch).toHaveAttribute('aria-checked', 'true');
    await user.click(blinkSwitch);
    expect(blinkSwitch).toHaveAttribute('aria-checked', 'false');
    await user.click(screen.getByRole('button', { name: strings.modeLabels.wipe }));
    await user.click(screen.getByRole('button', { name: strings.modeLabels.blink }));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders the same landscape photo on both sides, desaturating only the "before" side', () => {
    const { container } = renderDemo();
    const landscapeImages = Array.from(
      container.querySelectorAll<HTMLImageElement>('img[src="/demo/landscape.webp"]'),
    );
    expect(landscapeImages).toHaveLength(2);
    const desaturated = landscapeImages.filter((img) => img.style.filter.includes('saturate'));
    expect(desaturated).toHaveLength(1);
  });

  it('renders the caption from props', () => {
    renderDemo();
    expect(screen.getByText(strings.caption)).toBeInTheDocument();
  });
});
