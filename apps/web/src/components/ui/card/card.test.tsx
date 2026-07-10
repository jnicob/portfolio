import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('compone header, título y contenido', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Proyecto</CardTitle>
        </CardHeader>
        <CardContent>Detalle</CardContent>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Proyecto' })).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });
});
