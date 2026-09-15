import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillLevel } from './skill-level';

// Regression (qa-a11y-perf B2): axe reported `aria-prohibited-attr` (serious, 16 nodes in
// /es/ and /es/cv/) — a `<span aria-label>` without a non-implicit role has no ARIA semantics
// of its own, so `aria-label` is prohibited on that element. `role="img"` gives it an explicit
// role (treating the dots as a composite image/indicator), legitimately
// enabling the existing `aria-label`.
describe('SkillLevel', () => {
  it('el span con aria-label lleva role="img" (aria-label deja de estar prohibido)', () => {
    render(<SkillLevel level={3} label="Python: 3/5" />);
    const el = screen.getByLabelText('Python: 3/5');
    expect(el).toHaveAttribute('role', 'img');
  });

  it('sigue exponiendo el aria-label accesible y los 5 puntos decorativos', () => {
    render(<SkillLevel level={3} label="Python: 3/5" />);
    const el = screen.getByRole('img', { name: 'Python: 3/5' });
    expect(el.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });
});
