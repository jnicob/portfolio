import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/tabs';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { MediaKitDemo } from '@/components/showcase/media-kit-demo';

export const metadata: Metadata = { title: 'Showcase — UI primitives' };

const TOC = [
  { id: 'button', label: 'Button' },
  { id: 'badge', label: 'Badge' },
  { id: 'card', label: 'Card' },
  { id: 'form', label: 'Formulario' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'media-kit', label: 'Media kit' },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          {title}
        </h2>
        <p className="text-sm text-fg-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start lg:gap-12">
      <nav aria-label="Índice del showcase" className="hidden lg:block">
        <ul className="sticky top-12 flex flex-col gap-2 text-sm">
          {TOC.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {entry.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-14">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UI primitives</h1>
            <p className="mt-1 text-fg-muted">
              Kitchen sink del design system — todas las variantes y estados, en ambos temas.
            </p>
          </div>
          <ThemeSwitcher />
        </header>

        <Section
          id="button"
          title="Button"
          description="Acción principal del sistema: 4 variantes, 3 tamaños y estados deshabilitados."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section
          id="badge"
          title="Badge"
          description="Etiqueta compacta de estado o metadatos; el color nunca es el único canal."
        >
          <div className="flex flex-wrap gap-3">
            <Badge>Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
        </Section>

        <Section
          id="card"
          title="Card"
          description="Contenedor componible (header, título, contenido) para casos de estudio y resultados."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Case study</CardTitle>
              </CardHeader>
              <CardContent>Composición por children: header, título y contenido.</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado loading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado vacío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-3">
                  <p>Sin resultados todavía. Genera tu primera imagen para verla aquí.</p>
                  <Button size="sm" variant="secondary">
                    Crear imagen
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado error</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-3">
                  <p className="text-danger">
                    No se pudo cargar el resultado. Comprueba tu conexión.
                  </p>
                  <Button size="sm" variant="secondary">
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="form"
          title="Formulario (Field + Input + Select)"
          description="Campos accesibles: label, hint y error enlazados con aria-describedby."
        >
          <div className="grid max-w-md gap-4">
            <Field label="Prompt" htmlFor="demo-prompt" hint="Describe la imagen a generar.">
              <Input id="demo-prompt" placeholder="A serene mountain landscape" />
            </Field>
            <Field label="Aspect ratio" htmlFor="demo-ratio">
              <Select
                id="demo-ratio"
                options={[
                  { value: '1_1', label: '1:1' },
                  { value: '16_9', label: '16:9' },
                  { value: '9_16', label: '9:16' },
                ]}
              />
            </Field>
            <Field label="Con error" htmlFor="demo-error" error="Este campo es obligatorio.">
              <Input
                id="demo-error"
                aria-invalid
                aria-describedby="demo-error-error"
                defaultValue="!!!"
              />
            </Field>
            <Field
              label="Deshabilitado"
              htmlFor="demo-disabled"
              hint="Campo no editable en este plan."
            >
              <Input id="demo-disabled" disabled defaultValue="Solo lectura" />
            </Field>
            <Field label="Select deshabilitado" htmlFor="demo-select-disabled">
              <Select
                id="demo-select-disabled"
                disabled
                options={[{ value: '1_1', label: '1:1' }]}
              />
            </Field>
          </div>
        </Section>

        <Section
          id="tabs"
          title="Tabs"
          description="Pestañas APG con roving tabindex; los paneles persisten montados (sin perder estado al cambiar)."
        >
          <Tabs defaultValue="preview">
            <TabList label="Ejemplo de resultado">
              <Tab value="preview">Preview</Tab>
              <Tab value="api">API</Tab>
            </TabList>
            <TabPanel value="preview">
              <Card>
                <CardContent className="pt-6">Contenido del preview.</CardContent>
              </Card>
            </TabPanel>
            <TabPanel value="api">
              <pre className="overflow-x-auto rounded-card border border-border bg-surface p-4 font-mono text-sm text-fg">
                {`{ "status": "ok" }`}
              </pre>
            </TabPanel>
          </Tabs>
        </Section>

        <Section
          id="media-kit"
          title="@nicobehm/media-kit"
          description="Componentes media del paquete propio: CompareSlider (drag/hover, color/B-N) y MediaLightbox con zoom."
        >
          <MediaKitDemo />
        </Section>
      </div>
    </main>
  );
}
