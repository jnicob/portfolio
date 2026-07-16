import { describe, expect, it } from 'vitest';
import es from '../../messages/es.json';
import en from '../../messages/en.json';

/** Valor JSON genérico, sin `any`, suficiente para recorrer el árbol de mensajes. */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Recorre recursivamente un objeto de mensajes y devuelve el set de paths
 * (dot-notation) de todas las claves hoja (no-objeto). Los arrays se tratan
 * como hoja (no se indexa dentro de ellos): no hay ninguno en los mensajes
 * actuales y de haberlo, comparar su longitud/contenido excede el propósito
 * de este test de paridad estructural.
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
