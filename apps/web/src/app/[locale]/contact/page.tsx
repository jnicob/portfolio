import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { ContactForm, type ContactFormLabels } from '@/components/contact/contact-form';
import { JsonLd } from '@/components/seo/json-ld';
import { localizedPageMetadata, personJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return localizedPageMetadata({
    locale,
    path: '/contact',
    title: t('meta.title'),
    description: t('meta.description'),
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  const labels: ContactFormLabels = {
    badge: t('badge'),
    title: t('title'),
    subtitle: t('subtitle'),
    form: {
      subjectLabel: t('form.subjectLabel'),
      subjectPlaceholder: t('form.subjectPlaceholder'),
      emailLabel: t('form.emailLabel'),
      emailPlaceholder: t('form.emailPlaceholder'),
      phoneLabel: t('form.phoneLabel'),
      phonePlaceholder: t('form.phonePlaceholder'),
      phoneHint: t('form.phoneHint'),
      messageLabel: t('form.messageLabel'),
      messagePlaceholder: t('form.messagePlaceholder'),
      submit: t('form.submit'),
      submitting: t('form.submitting'),
      charCount: t('form.charCount'),
      errors: {
        subjectRequired: t('form.errors.subjectRequired'),
        emailInvalid: t('form.errors.emailInvalid'),
        messageRequired: t('form.errors.messageRequired'),
      },
    },
    status: {
      successTitle: t('status.successTitle'),
      successMessage: t('status.successMessage'),
      exploreTitle: t('status.exploreTitle'),
      viewCv: t('status.viewCv'),
      viewProjects: t('status.viewProjects'),
      linkedin: t('status.linkedin'),
      errorTitle: t('status.errorTitle'),
      errorMessage: t('status.errorMessage'),
      retry: t('status.retry'),
    },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <JsonLd data={personJsonLd(locale)} />
      <ContactForm labels={labels} />
    </main>
  );
}
