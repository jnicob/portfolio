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

export const metadata: Metadata = { title: 'Showcase — UI primitives' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">UI primitives</h1>
          <p className="mt-1 text-fg-muted">
            Kitchen sink del design system — todas las variantes y estados, en ambos temas.
          </p>
        </div>
        <ThemeSwitcher />
      </header>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-3">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </Section>

      <Section title="Card">
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
        </div>
      </Section>

      <Section title="Formulario (Field + Input + Select)">
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
            <Input id="demo-error" aria-invalid aria-describedby="demo-error-error" />
          </Field>
        </div>
      </Section>

      <Section title="Tabs">
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
            <pre className="overflow-x-auto rounded-card border border-border bg-surface p-4 font-mono text-sm text-fg-muted">
              {`{ "status": "ok" }`}
            </pre>
          </TabPanel>
        </Tabs>
      </Section>
    </main>
  );
}
