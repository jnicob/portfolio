import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillLevel } from './skill-level';

// Regresión (qa-a11y-perf B2): axe reportaba `aria-prohibited-attr` (serious, 16 nodos en
// /es/ y /es/cv/) — un `<span aria-label>` sin rol no implícito no tiene semántica ARIA
// propia, así que `aria-label` queda prohibido en ese elemento. `role="img"` le da un rol
// explícito (tratando los puntos como una imagen/indicador compuesto), habilitando
// legítimamente el `aria-label` existente.
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
