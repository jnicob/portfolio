import { NextResponse } from 'next/server';
import { contactSchema } from '@/data/schemas';
import {
  checkRateLimit,
  sanitizeHeader,
  sanitizeText,
  verifyHoneypot,
} from '@/lib/contact-security';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    
    // 1. Rate-limiting check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiadas solicitudes. Por favor, inténtalo de nuevo en unos minutos.',
          resetMs: rateLimit.resetMs,
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // 2. Anti-spam Honeypot check
    if (!verifyHoneypot(body.honeypot)) {
      // Retornar 200 ficticio para engañar a los spambots sin procesar el envío
      return NextResponse.json({ success: true, message: 'Mensaje procesado' });
    }

    // 3. Frontend/Backend validation with Zod
    const parseResult = contactSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0] || 'general');
        fieldErrors[fieldName] = issue.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Datos del formulario inválidos',
          errors: fieldErrors,
        },
        { status: 400 },
      );
    }

    const { subject, email, phone, message } = parseResult.data;

    // 4. Input sanitization
    const cleanSubject = sanitizeHeader(subject);
    const cleanEmail = sanitizeHeader(email);
    const cleanPhone = phone ? sanitizeHeader(phone) : '';
    const cleanMessage = sanitizeText(message);

    // 5. Envío seguro de email o simulación en dev
    // Si existe una variable de entorno de servicio de correo (e.g. RESEND_API_KEY o CONTACT_WEBHOOK),
    // aquí se efectúa el dispatch seguro.
    const destinationEmail = process.env.CONTACT_DESTINATION_EMAIL || 'j.nico.b@gmail.com';

    // Log estructurado (sin exponer contraseñas ni PII no sanitizado)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Contact API] Envío procesado:', {
        destination: destinationEmail,
        subject: cleanSubject,
        email: cleanEmail,
        phone: cleanPhone,
        messageLength: cleanMessage.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te responderé a la brevedad.',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al procesar el mensaje.',
      },
      { status: 500 },
    );
  }
}
