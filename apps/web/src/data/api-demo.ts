/**
 * Datos de ejemplo para `ApiRequestPlayer` (showcase T19, reutilizado por el
 * playground real en F4). Request/response inventados, genéricos, estilo
 * Freepik API — nada real ni sensible.
 */
export type ApiDemo = {
  method: 'POST';
  path: string;
  request: object;
  response: object;
  status: string;
  /**
   * Preview mostrada en el panel Preview del player al llegar a `done` (T13):
   * asset real de la galería (`nbp-amanecer-alpino`), coherente con la request
   * `text-to-image` de abajo — el paisaje que "devuelve" ese endpoint simulado.
   */
  preview: { src: string; fullSrc: string; width: number; height: number };
};

export const apiDemo: ApiDemo = {
  method: 'POST',
  path: '/v1/ai/text-to-image',
  request: {
    prompt: 'A serene mountain landscape at golden hour',
    aspect_ratio: 'widescreen_16_9',
    seed: 42,
  },
  response: {
    task_id: 'task_01j8…',
    status: 'COMPLETED',
    generated: ['https://cdn.example.com/result.webp'],
  },
  status: '200 OK',
  preview: {
    src: '/demo/gallery/nbp-amanecer-alpino.webp',
    fullSrc: '/demo/gallery/nbp-amanecer-alpino-hd.webp',
    width: 1200,
    height: 670,
  },
};
