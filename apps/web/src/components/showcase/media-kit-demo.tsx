'use client';

import { useState } from 'react';
import { CompareSlider, MediaLightbox } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

export function MediaKitDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <CompareSlider
        before={<img src="/demo/before.svg" alt="Imagen original en baja resolución" />}
        after={<img src="/demo/after.svg" alt="" />}
        label="Comparar antes y después"
      />
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir en fullscreen
        </Button>
        <MediaLightbox
          open={open}
          onClose={() => setOpen(false)}
          label="Resultado a pantalla completa"
        >
          <img src="/demo/after.svg" alt="Resultado procesado a pantalla completa" />
        </MediaLightbox>
      </div>
    </div>
  );
}
