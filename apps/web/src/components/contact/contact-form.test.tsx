import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContactForm, type ContactFormLabels } from './contact-form';

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

  it('muestra mensajes de error Zod si se intenta enviar vacío', async () => {
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

  it('procesa el envío exitosamente cuando los campos son válidos', async () => {
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
});
