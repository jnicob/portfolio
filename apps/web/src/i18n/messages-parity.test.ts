import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';

/** Generic JSON value, without `any`, sufficient to traverse the message tree. */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Recursively traverses a messages object and returns the set of paths
 * (dot-notation) of all leaf keys (non-object). Arrays are treated
 * as leaves (they are not indexed into): there are none in the current
 * messages and if there were, comparing their length/content exceeds the purpose
 * of this structural parity test.
 */
function leafKeyPaths(node: JsonValue, prefix = ''): Set<string> {
  const paths = new Set<string>();
  if (node === null || typeof node !== 'object' || Array.isArray(node)) {
    if (prefix) paths.add(prefix);
    return paths;
  }
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    for (const leaf of leafKeyPaths(value, path)) paths.add(leaf);
  }
  return paths;
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((key) => !b.has(key)).sort();
}

describe('paridad estructural de mensajes es/en', () => {
  it('expone exactamente el mismo set de claves en ambos idiomas', () => {
    const esKeys = leafKeyPaths(es);
    const enKeys = leafKeyPaths(en);

    const onlyInEs = diff(esKeys, enKeys);
    const onlyInEn = diff(enKeys, esKeys);

    expect({ onlyInEs, onlyInEn }).toEqual({ onlyInEs: [], onlyInEn: [] });
  });
});
