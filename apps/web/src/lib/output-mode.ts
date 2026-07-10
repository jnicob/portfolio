export type OutputMode = 'export' | 'node';

/** Runtime dual: 'export' (estático, default) o 'node' (SSR + route handlers). */
export function resolveOutputMode(env: Record<string, string | undefined>): OutputMode {
  return env.NEXT_OUTPUT_MODE === 'node' ? 'node' : 'export';
}
