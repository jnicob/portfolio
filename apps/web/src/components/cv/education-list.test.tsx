import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { education } from '@/data/education';
import { EducationList } from './education-list';

describe('EducationList', () => {
  it('renders degree, institution, and year range for each entry', () => {
    render(<EducationList education={education} locale="es" />);

    for (const entry of education) {
      expect(screen.getByText(entry.degree.es)).toBeInTheDocument();
      expect(screen.getByText(entry.institution, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(`${entry.start} — ${entry.end}`)).toBeInTheDocument();
    }
  });
});
