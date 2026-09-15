export type OutputMode = 'export' | 'node';

/** Dual runtime: 'export' (static, default) or 'node' (SSR + route handlers). */
export function resolveOutputMode(env: Record<string, string | undefined>): OutputMode {
  return env.NEXT_OUTPUT_MODE === 'node' ? 'node' : 'export';
}
