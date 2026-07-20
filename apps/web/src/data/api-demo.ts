/**
 * Ejemplos del `ApiRequestPlayer`: requests/responses inventados y genéricos.
 * Los previews reutilizan assets de la galería, sin añadir bytes de media.
 */
import { galleryItems } from './gallery';
import type { GalleryItem } from './schemas';

export type ApiDemoExampleId = 'image' | 'video' | 'audio' | 'error';

export type ApiDemoPreview =
  | { kind: 'image'; src: string; fullSrc: string; width: number; height: number }
  | { kind: 'video'; src: string; poster: string; width: number; height: number }
  | {
      kind: 'audio';
      src: string;
      cover: string;
      coverHd: string;
      width: number;
      height: number;
    }
  | { kind: 'error' };

export type ApiDemoExample = {
  id: ApiDemoExampleId;
  method: 'POST';
  path: string;
  request: object;
  response: object;
  status: string;
  preview: ApiDemoPreview;
};

/** Falla en build/test si un asset compartido desaparece o cambia de tipo. */
function galleryItemOf<T extends GalleryItem['type']>(
  id: string,
  type: T,
): Extract<GalleryItem, { type: T }> {
  const item = galleryItems.find((entry) => entry.id === id && entry.type === type);
  if (!item) throw new Error(`api-demo: falta el ítem de galería '${id}' (${type})`);
  return item as Extract<GalleryItem, { type: T }>;
}

const image = galleryItemOf('nbp-amanecer-alpino', 'image');
const video = galleryItemOf('veo-costa-atardecer', 'video');
const audio = galleryItemOf('audio-lofi', 'audio');

export const apiDemoExamples: readonly ApiDemoExample[] = [
  {
    id: 'image',
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
      kind: 'image',
      src: image.src,
      fullSrc: image.hdSrc,
      width: image.width,
      height: image.height,
    },
  },
  {
    id: 'video',
    method: 'POST',
    path: '/v1/ai/text-to-video',
    request: {
      prompt: 'Drone shot over waves breaking at sunset',
      duration: 5,
      aspect_ratio: 'widescreen_16_9',
    },
    response: {
      task_id: 'task_01j9…',
      status: 'COMPLETED',
      generated: ['https://cdn.example.com/result.mp4'],
    },
    status: '200 OK',
    preview: {
      kind: 'video',
      src: video.src,
      poster: video.poster,
      width: video.width,
      height: video.height,
    },
  },
  {
    id: 'audio',
    method: 'POST',
    path: '/v1/ai/text-to-music',
    request: {
      prompt: 'Relaxed lo-fi beat for late-night coding',
      duration: 30,
    },
    response: {
      task_id: 'task_01ja…',
      status: 'COMPLETED',
      generated: ['https://cdn.example.com/result.mp3'],
    },
    status: '200 OK',
    preview: {
      kind: 'audio',
      src: audio.src,
      cover: audio.cover,
      coverHd: audio.coverHd,
      width: audio.width,
      height: audio.height,
    },
  },
  {
    id: 'error',
    method: 'POST',
    path: '/v1/ai/text-to-image',
    request: {
      prompt: 'A serene mountain landscape at golden hour',
      aspect_ratio: 'ultra_wide_32_9',
    },
    response: {
      error: {
        code: 'validation_error',
        message:
          "Invalid value for 'aspect_ratio': expected one of square_1_1, widescreen_16_9, social_story_9_16.",
        param: 'aspect_ratio',
      },
    },
    status: '400 Bad Request',
    preview: { kind: 'error' },
  },
];
