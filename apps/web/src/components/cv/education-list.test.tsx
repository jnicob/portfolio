import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { education } from '@/data/education';
import { EducationList } from './education-list';

describe('EducationList', () => {
  it('renderiza degree, institución y rango de años de cada entrada', () => {
    render(<EducationList education={education} locale="es" />);

    for (const entry of education) {
      expect(screen.getByText(entry.degree.es)).toBeInTheDocument();
      expect(screen.getByText(entry.institution, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${entry.start} — ${entry.end}`)).toBeInTheDocument();
    }
  });
});
