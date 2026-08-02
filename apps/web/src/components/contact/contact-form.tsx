'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { contactSchema, type ContactInput } from '@/data/schemas';
import { profile } from '@/data/profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea/textarea';

export type ContactFormLabels = {
  badge: string;
  title: string;
  subtitle: string;
  form: {
    subjectLabel: string;
    subjectPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneHint: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    charCount: string;
    errors: {
      subjectRequired: string;
      emailInvalid: string;
      messageRequired: string;
    };
  };
  status: {
    successTitle: string;
    successMessage: string;
    exploreTitle: string;
    viewCv: string;
    viewProjects: string;
    linkedin: string;
    errorTitle: string;
    errorMessage: string;
    retry: string;
  };
};

export type ContactFormProps = {
  labels: ContactFormLabels;
  /** Permite inyectar handler personalizado de envío para tests o integraciones */
  onSubmitHandler?: (data: ContactInput) => Promise<{ success: boolean; error?: string }>;
};

const INITIAL_FORM: ContactInput = {
  subject: '',
  email: '',
  phone: '',
  message: '',
  honeypot: '',
};

export function ContactForm({ labels, onSubmitHandler }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  // Timestamp anti-bot: registra cuándo se cargó el formulario
  const [formStartTs] = useState(() => Date.now());

  const handleFieldChange = (
    field: keyof ContactInput,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpia el error del campo al editar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ContactInput) => {
    const parseResult = contactSchema.safeParse(formData);
    if (!parseResult.success) {
      const issue = parseResult.error.issues.find((item) => item.path[0] === field);
      if (issue) {
        setErrors((prev) => ({ ...prev, [field]: issue.message }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    // 1. Verificación Honeypot anti-spam
    if (formData.honeypot && formData.honeypot.trim().length > 0) {
      // Simula éxito para spambots sin realizar petición real
      setStatus('success');
      return;
    }

    // 2. Validación frontend con Zod (nico-zod)
    const parseResult = contactSchema.safeParse(formData);
    if (!parseResult.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ContactInput;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus('submitting');

    try {
      if (onSubmitHandler) {
        const res = await onSubmitHandler(parseResult.data);
        if (res.success) {
          setStatus('success');
          setFormData(INITIAL_FORM);
          setErrors({});
        } else {
          setServerError(res.error || labels.status.errorMessage);
          setStatus('error');
        }
        return;
      }

      // Endpoint configurable: PHP en producción, Route Handler Node en dev local
      const endpoint =
        process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '/api/contact.php';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parseResult.data,
          ts: formStartTs,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok !== false) {
        setStatus('success');
        setFormData(INITIAL_FORM);
        setErrors({});
      } else {
        setServerError(data?.error || labels.status.errorMessage);
        setStatus('error');
      }
    } catch {
      setServerError(labels.status.errorMessage);
      setStatus('error');
    }
  };

  const maxChars = 2000;
  const currentChars = formData.message.length;

  return (
    <Card className="p-6 sm:p-8 max-w-2xl mx-auto shadow-sm border-border bg-surface">
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center text-center py-6 gap-4" role="status">
          <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-fg">{labels.status.successTitle}</h2>
          <p className="text-fg-muted max-w-md">{labels.status.successMessage}</p>

          <div className="w-full max-w-md mt-4 pt-6 border-t border-border flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-fg">{labels.status.exploreTitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/cv"
                className="inline-flex h-9 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-fg hover:border-fg-muted transition-colors"
              >
                {labels.status.viewCv}
              </a>
              <a
                href="/projects"
                className="inline-flex h-9 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-fg hover:border-fg-muted transition-colors"
              >
                {labels.status.viewProjects}
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-control bg-accent text-accent-fg px-4 text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                {labels.status.linkedin} ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{labels.badge}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-fg">{labels.title}</h1>
            <p className="text-sm text-fg-muted">{labels.subtitle}</p>
          </div>

          {/* Campo Trampas Honeypot (Oculto visualmente) */}
          <div className="hidden aria-hidden:hidden" aria-hidden="true">
            <label htmlFor="website">Website (no rellenar)</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot || ''}
              onChange={(e) => handleFieldChange('honeypot', e.target.value)}
            />
          </div>

          {serverError && (
            <div className="p-4 rounded-control bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-3" role="alert">
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="font-semibold">{labels.status.errorTitle}</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo Asunto */}
            <Field
              label={labels.form.subjectLabel}
              htmlFor="contact-subject"
              error={errors.subject}
            >
              <Input
                id="contact-subject"
                name="subject"
                type="text"
                required
                placeholder={labels.form.subjectPlaceholder}
                value={formData.subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                disabled={status === 'submitting'}
              />
            </Field>

            {/* Campo Email */}
            <Field
              label={labels.form.emailLabel}
              htmlFor="contact-email"
              error={errors.email}
            >
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder={labels.form.emailPlaceholder}
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                disabled={status === 'submitting'}
              />
            </Field>
          </div>

          {/* Campo Teléfono (Opcional) */}
          <Field
            label={labels.form.phoneLabel}
            htmlFor="contact-phone"
            hint={labels.form.phoneHint}
            error={errors.phone}
          >
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              placeholder={labels.form.phonePlaceholder}
              value={formData.phone || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
              disabled={status === 'submitting'}
            />
          </Field>

          {/* Campo Mensaje */}
          <Field
            label={labels.form.messageLabel}
            htmlFor="contact-message"
            error={errors.message}
          >
            <div className="flex flex-col gap-1">
              <Textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder={labels.form.messagePlaceholder}
                value={formData.message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                disabled={status === 'submitting'}
              />
              <div className="text-right text-xs text-fg-muted">
                {labels.form.charCount.replace('{current}', String(currentChars)).replace('{max}', String(maxChars))}
              </div>
            </div>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto self-end mt-2 min-w-[160px]"
          >
            {status === 'submitting' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-accent-fg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {labels.form.submitting}
              </span>
            ) : (
              labels.form.submit
            )}
          </Button>
        </form>
      )}
    </Card>
  );
}
