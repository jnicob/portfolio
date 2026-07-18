import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '@/data/experience';
import { ExperienceEntryBlock } from './experience-entry';

const PRESENT_LABEL = 'Actualidad';

describe('ExperienceEntryBlock', () => {
  it('renderiza rol ES y empresa en el heading, y el resumen', () => {
    const entry = experience[0]!;
    render(<ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent(entry.role.es);
    expect(heading).toHaveTextContent(entry.company);
    expect(screen.getByText(entry.summary.es)).toBeInTheDocument();
  });

  it('muestra el rango de fechas con presentLabel cuando end es null', () => {
    // Ninguna entrada real tiene end === null (todas las etapas están cerradas);
    // se construye una entrada sintética para probar el contrato del componente.
    const entry = { ...experience[0]!, end: null };
    render(<ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} />);

    expect(screen.getByText(`${entry.start} — ${PRESENT_LABEL}`)).toBeInTheDocument();
  });

  it('muestra el rango de fechas con el end real cuando no es null', () => {
    const entry = experience.find((e) => e.end !== null)!;
    render(<ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} />);

    expect(screen.getByText(`${entry.start} — ${entry.end}`)).toBeInTheDocument();
  });

  it('renderiza los highlights como lista', () => {
    const entry = experience[0]!;
    render(<ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} />);

    for (const highlight of entry.highlights) {
      expect(screen.getByText(highlight.es)).toBeInTheDocument();
    }
  });

  it('con dense=true no renderiza la lista de highlights', () => {
    const entry = experience[0]!;
    render(<ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} dense />);

    for (const highlight of entry.highlights) {
      expect(screen.queryByText(highlight.es)).not.toBeInTheDocument();
    }
  });

  it('con hideDates=true no renderiza el rango de fechas (lo pinta el contenedor)', () => {
    const entry = experience[0]!;
    render(
      <ExperienceEntryBlock entry={entry} locale="es" presentLabel={PRESENT_LABEL} hideDates />,
    );

    expect(screen.queryByText(`${entry.start} — ${entry.end}`)).not.toBeInTheDocument();
  });
});
