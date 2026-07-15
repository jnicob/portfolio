import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MediaLightboxLabels } from '@nicobehm/media-kit';
import type { Locale } from '@/i18n/routing';
import { localizedPageMetadata } from '@/lib/seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/tabs';
import { ShareViewButton } from '@/components/layout/share-view-button';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { MediaKitDemo } from '@/components/showcase/media-kit-demo';
import { ShowcaseIndex } from '@/components/showcase/showcase-index';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'showcase' });
  return localizedPageMetadata({
    locale,
    path: '/showcase',
    title: t('meta.title'),
    description: t('meta.description'),
  });
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
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

export default async function ShowcasePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('showcase');
  const tShare = await getTranslations('share');

  const toc = [
    { id: 'button', label: t('toc.button') },
    { id: 'badge', label: t('toc.badge') },
    { id: 'card', label: t('toc.card') },
    { id: 'form', label: t('toc.form') },
    { id: 'tabs', label: t('toc.tabs') },
    { id: 'media-kit', label: t('toc.mediaKit') },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start lg:gap-12">
      <nav aria-label={t('tocLabel')} className="hidden lg:block">
        <div className="sticky top-12">
          <ShowcaseIndex
            items={toc}
            inputLabel={t('filterLabel')}
            emptyMessage={t('filterEmpty')}
          />
        </div>
      </nav>
      <div className="flex flex-col gap-14">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="mt-1 text-fg-muted">{t('intro')}</p>
            <div className="mt-3">
              <ShareViewButton
                labels={{
                  share: tShare('share'),
                  copied: tShare('copied'),
                  error: tShare('error'),
                }}
              />
            </div>
          </div>
          <ThemeSwitcher />
        </header>

        <Section
          id="button"
          title={t('sections.button.title')}
          description={t('sections.button.description')}
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
          title={t('sections.badge.title')}
          description={t('sections.badge.description')}
        >
          <div className="flex flex-wrap gap-3">
            <Badge>Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
        </Section>

        <Section
          id="card"
          title={t('sections.card.title')}
          description={t('sections.card.description')}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.card.sampleTitle')}</CardTitle>
              </CardHeader>
              <CardContent>{t('sections.card.compositionBody')}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.card.loadingTitle')}</CardTitle>
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
                <CardTitle>{t('sections.card.emptyTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-3">
                  <p>{t('sections.card.emptyBody')}</p>
                  <Button size="sm" variant="secondary">
                    {t('sections.card.emptyCta')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.card.errorTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-3">
                  <p className="text-danger">{t('sections.card.errorBody')}</p>
                  <Button size="sm" variant="secondary">
                    {t('sections.card.errorCta')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="form"
          title={t('sections.form.title')}
          description={t('sections.form.description')}
        >
          <div className="grid max-w-md gap-4">
            <Field
              label={t('sections.form.promptLabel')}
              htmlFor="demo-prompt"
              hint={t('sections.form.promptHint')}
            >
              <Input id="demo-prompt" placeholder="A serene mountain landscape" />
            </Field>
            <Field label={t('sections.form.aspectRatioLabel')} htmlFor="demo-ratio">
              <Select
                id="demo-ratio"
                options={[
                  { value: '1_1', label: '1:1' },
                  { value: '16_9', label: '16:9' },
                  { value: '9_16', label: '9:16' },
                ]}
              />
            </Field>
            <Field
              label={t('sections.form.errorLabel')}
              htmlFor="demo-error"
              error={t('sections.form.errorMessage')}
            >
              <Input
                id="demo-error"
                aria-invalid
                aria-describedby="demo-error-error"
                defaultValue="!!!"
              />
            </Field>
            <Field
              label={t('sections.form.disabledLabel')}
              htmlFor="demo-disabled"
              hint={t('sections.form.disabledHint')}
            >
              <Input id="demo-disabled" disabled defaultValue={t('sections.form.disabledValue')} />
            </Field>
            <Field label={t('sections.form.selectDisabledLabel')} htmlFor="demo-select-disabled">
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
          title={t('sections.tabs.title')}
          description={t('sections.tabs.description')}
        >
          <Tabs defaultValue="preview">
            <TabList label={t('sections.tabs.tabListLabel')}>
              <Tab value="preview">{t('sections.tabs.previewTab')}</Tab>
              <Tab value="api">{t('sections.tabs.apiTab')}</Tab>
            </TabList>
            <TabPanel value="preview">
              <Card>
                <CardContent className="pt-6">{t('sections.tabs.previewContent')}</CardContent>
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
          title={t('sections.mediaKit.title')}
          description={t('sections.mediaKit.description')}
        >
          <MediaKitDemo
            labels={t.raw('lightboxLabels') as MediaLightboxLabels}
            strings={{
              beforeAfterAlt: t('sections.mediaKit.beforeAfterAlt'),
              dragCompareLabel: t('sections.mediaKit.dragCompareLabel'),
              dragCaption: t('sections.mediaKit.dragCaption'),
              hoverCompareLabel: t('sections.mediaKit.hoverCompareLabel'),
              hoverCaption: t('sections.mediaKit.hoverCaption'),
              fullScreen: t('sections.mediaKit.fullScreen'),
              compareLightboxLabel: t('sections.mediaKit.compareLightboxLabel'),
              portraitBeforeAlt: t('sections.mediaKit.portraitBeforeAlt'),
              portraitCompareLabel: t('sections.mediaKit.portraitCompareLabel'),
              portraitCaption: t('sections.mediaKit.portraitCaption'),
            }}
          />
        </Section>
      </div>
    </main>
  );
}
