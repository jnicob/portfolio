'use client';

import { useState } from 'react';
import { CompareSlider, MediaLightbox } from '@nicobehm/media-kit';
import { Button } from '@/components/ui/button';

export function MediaKitDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="flex flex-col gap-2">
          <CompareSlider
            before={<img src="/demo/photo-before.svg" alt="Imagen original en baja resolución" />}
            after={<img src="/demo/photo-after.svg" alt="" />}
            label="Comparar antes y después (drag)"
          />
          <figcaption className="text-sm text-fg-muted">
            mode=&quot;drag&quot; — arrastra el divisor
          </figcaption>
        </figure>
        <figure className="flex flex-col gap-2">
          <CompareSlider
            mode="hover"
            before={<img src="/demo/photo-before.svg" alt="Imagen original en baja resolución" />}
            after={<img src="/demo/photo-after.svg" alt="" />}
            label="Comparar antes y después (hover)"
          />
          <figcaption className="text-sm text-fg-muted">
            mode=&quot;hover&quot; — sigue al ratón sin click
          </figcaption>
        </figure>
      </div>
      <Button variant="secondary" className="self-start" onClick={() => setOpen(true)}>
        Abrir en fullscreen
      </Button>
      <MediaLightbox
        open={open}
        onClose={() => setOpen(false)}
        label="Resultado a pantalla completa"
        labels={{
          controls: 'Controles',
          zoomIn: 'Acercar',
          zoomOut: 'Alejar',
          zoomLevel: 'Zoom {percent}%',
          reset: 'Restablecer vista',
          fit: 'Ajuste: {current}. Cambiar a {next}',
          fullscreen: 'Pantalla completa',
          exitFullscreen: 'Salir de pantalla completa',
          hideControls: 'Ocultar controles',
          showControls: 'Mostrar controles',
          close: 'Cerrar',
        }}
      >
        <img src="/demo/photo-after.svg" alt="Resultado procesado a pantalla completa" />
      </MediaLightbox>
    </div>
  );
}
