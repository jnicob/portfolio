import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST as postContactRoute } from '@/app/api/contact/route';
import { clearRateLimitStore } from '@/lib/contact-security';
import { ContactForm, resolveContactEndpoint, type ContactFormLabels } from './contact-form';

vi.mock('@/i18n/navigation', () => ({
  Link: (props: Record<string, unknown>) => <a {...props} />,
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

const MOCK_LABELS: ContactFormLabels = {
  badge: 'Hablemos',
  title: 'Contacto',
  subtitle: 'Envíame un mensaje y te responderé lo antes posible.',
  form: {
    subjectLabel: 'Asunto *',
    subjectPlaceholder: 'Ej: Proyecto de IA',
    emailLabel: 'Correo electrónico *',
    emailPlaceholder: 'tu.email@ejemplo.com',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '+34 600 000 000',
    phoneHint: 'Opcional — para contacto directo',
    messageLabel: 'Mensaje *',
    messagePlaceholder: 'Describe tu proyecto...',
    submit: 'Enviar mensaje',
    submitting: 'Enviando...',
    charCount: '{current} / {max} caracteres',
    errors: {
      subjectRequired: 'El asunto debe tener al menos 3 caracteres',
      emailInvalid: 'Introduce un email válido',
      messageRequired: 'El mensaje debe tener al menos 10 caracteres',
    },
  },
  status: {
    successTitle: '¡Mensaje enviado!',
    successMessage: 'Gracias por contactar.',
    exploreTitle: 'Mientras respondo, te invito a explorar mi trabajo:',
    viewCv: 'Ver CV',
    viewProjects: 'Ver Proyectos',
    linkedin: 'Conectar en LinkedIn',
    errorTitle: 'Ocurrió un problema',
    errorMessage: 'No se pudo entregar el mensaje en este momento.',
    retry: 'Volver a intentar',
  },
};

describe('ContactForm', () => {
  it('renderiza los campos requeridos y opcionales', () => {
    render(<ContactForm labels={MOCK_LABELS} />);

    expect(screen.getByLabelText(/Asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar mensaje/i })).toBeInTheDocument();
  });

  it('shows Zod error messages when attempting to submit empty', async () => {
    const user = userEvent.setup();
    render(<ContactForm labels={MOCK_LABELS} />);

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    expect(
      await screen.findByText(/El asunto debe tener al menos 3 caracteres/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Introduce un email válido/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/El mensaje debe tener al menos 10 caracteres/i),
    ).toBeInTheDocument();
  });

  it('processes submission successfully when fields are valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue({ success: true });

    render(<ContactForm labels={MOCK_LABELS} onSubmitHandler={handleSubmit} />);

    await user.type(screen.getByLabelText(/Asunto/i), 'Consulta sobre desarrollo');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'cliente@ejemplo.com');
    await user.type(
      screen.getByLabelText(/Mensaje/i),
      'Hola Nico, queremos presupuestar un proyecto web.',
    );

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        subject: 'Consulta sobre desarrollo',
        email: 'cliente@ejemplo.com',
        phone: '',
        message: 'Hola Nico, queremos presupuestar un proyecto web.',
        honeypot: '',
      });
    });

    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver CV' })).toHaveAttribute('href', '/cv');
    expect(screen.getByRole('link', { name: 'Ver Proyectos' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('link', { name: /Conectar en LinkedIn/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/nicobehm',
    );
  });

  it('maneja el honeypot tramposo sin llamar al servidor', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ContactForm labels={MOCK_LABELS} onSubmitHandler={handleSubmit} />);

    const honeypotInput = screen.getByLabelText(/Website \(no rellenar\)/i);
    await user.type(honeypotInput, 'bot spammer link');

    await user.type(screen.getByLabelText(/Asunto/i), 'Consulta de bot');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'bot@example.com');
    await user.type(screen.getByLabelText(/Mensaje/i), 'Mensaje de spam automático.');

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    await waitFor(() => {
      expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument();
    });

    // No debe haber llamado al backend real
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('displays localized English validation messages from labels.form.errors instead of hardcoded Spanish schema strings', async () => {
    const user = userEvent.setup();
    const enLabels: ContactFormLabels = {
      ...MOCK_LABELS,
      form: {
        ...MOCK_LABELS.form,
        submit: 'Send message',
        errors: {
          subjectRequired: 'Subject must be at least 3 characters',
          emailInvalid: 'Please enter a valid email',
          phoneInvalid: 'Phone must contain at least 6 digits and only valid characters',
          messageRequired: 'Message must be at least 10 characters',
        },
      },
    };

    render(<ContactForm labels={enLabels} />);
    await user.type(screen.getByLabelText(/Teléfono/i), '123');
    await user.click(screen.getByRole('button', { name: /Send message/i }));

    expect(await screen.findByText('Subject must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    expect(
      screen.getByText('Phone must contain at least 6 digits and only valid characters'),
    ).toBeInTheDocument();
    expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves endpoint to /api/contact/ on localhost or development and /api/contact.php in production', () => {
    expect(resolveContactEndpoint(undefined, 'localhost', 'production')).toBe('/api/contact/');
    expect(resolveContactEndpoint(undefined, '127.0.0.1', 'production')).toBe('/api/contact/');
    expect(resolveContactEndpoint(undefined, 'jnicob.dev', 'development')).toBe('/api/contact/');
    expect(resolveContactEndpoint(undefined, 'jnicob.dev', 'production')).toBe('/api/contact.php');
    expect(resolveContactEndpoint('/custom/endpoint', 'jnicob.dev', 'production')).toBe(
      '/custom/endpoint',
    );
  });

  it('submits via real fetch to /api/contact/ on localhost without hitting 405 on static contact.php', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<ContactForm labels={MOCK_LABELS} />);

    await user.type(screen.getByLabelText(/Asunto/i), 'prueba desde web +');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'j.nicob@gmail.com');
    await user.type(screen.getByLabelText(/Teléfono/i), '672814444');
    await user.type(screen.getByLabelText(/Mensaje/i), 'prueba de que sigue funcionando');

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const [calledUrl, calledInit] = fetchSpy.mock.calls[0]!;
    expect(calledUrl).toBe('/api/contact/');
    expect(calledInit?.method).toBe('POST');
    const parsedBody = JSON.parse(String(calledInit?.body));
    expect(parsedBody).toMatchObject({
      subject: 'prueba desde web +',
      email: 'j.nicob@gmail.com',
      phone: '672814444',
      message: 'prueba de que sigue funcionando',
      honeypot: '',
    });
    expect(typeof parsedBody.ts).toBe('number');
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
  });

  it('automatically retries the alternate endpoint if the primary endpoint returns 405 Method Not Allowed', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 405, statusText: 'Method Not Allowed' }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    render(<ContactForm labels={MOCK_LABELS} />);

    await user.type(screen.getByLabelText(/Asunto/i), 'prueba fallback 405');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'j.nicob@gmail.com');
    await user.type(screen.getByLabelText(/Mensaje/i), 'prueba de que el fallback 405 funciona');

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('/api/contact/');
    expect(fetchSpy.mock.calls[1]?.[0]).toBe('/api/contact.php');
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
  });

  it('integrates end-to-end with the real POST /api/contact/ Route Handler without schema or method mismatches', async () => {
    clearRateLimitStore();
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? `http://localhost:3000${input}` : input.toString();
      const req = new Request(url, init);
      return postContactRoute(req);
    });

    render(<ContactForm labels={MOCK_LABELS} />);

    await user.type(screen.getByLabelText(/Asunto/i), 'prueba desde web +');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'j.nicob@gmail.com');
    await user.type(screen.getByLabelText(/Teléfono/i), '672814490');
    await user.type(screen.getByLabelText(/Mensaje/i), 'prueba de que sigue funcionando');

    await user.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
  });
});
