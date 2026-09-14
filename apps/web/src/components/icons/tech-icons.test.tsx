import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TechIcon, TechIconStrip, TECH_KEYS } from './tech-icons';

describe('TechIcon', () => {
  it('renders individual icons with accessible names', () => {
    render(<TechIcon name="typescript" />);
    expect(screen.getByTitle('TypeScript')).toBeInTheDocument();
  });

  it('renders TechIconStrip with all core technologies', () => {
    render(<TechIconStrip />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('contains expected number of tech keys', () => {
    expect(TECH_KEYS.length).toBeGreaterThanOrEqual(16);
  });
});
