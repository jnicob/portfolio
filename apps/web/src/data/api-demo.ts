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
};
