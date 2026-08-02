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

    // 5. Envío seguro de email (Resend / Web3Forms / Webhook / Log dev)
    const destinationEmail = process.env.CONTACT_DESTINATION_EMAIL || 'j.nico.b@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    const web3FormsKey = process.env.WEB3FORMS_KEY;
    const webhookUrl = process.env.CONTACT_WEBHOOK;

    let emailSent = false;

    // A) Envío vía Resend API (si está configurada la API key)
    if (resendApiKey) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: [destinationEmail],
            reply_to: cleanEmail,
            subject: `[Portfolio Contacto] ${cleanSubject}`,
            html: `
              <h2>Nuevo mensaje de contacto desde jnicob.dev</h2>
              <p><strong>De:</strong> ${cleanEmail}</p>
              ${cleanPhone ? `<p><strong>Teléfono:</strong> ${cleanPhone}</p>` : ''}
              <p><strong>Asunto:</strong> ${cleanSubject}</p>
              <hr />
              <p style="white-space: pre-wrap;">${cleanMessage}</p>
            `,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
        } else {
          const resendError = await resendResponse.json().catch(() => null);
          console.error('[Contact API] Error al enviar con Resend:', resendError);
        }
      } catch (err) {
        console.error('[Contact API] Excepción al llamar a Resend API:', err);
      }
    }

    // B) Envío vía Web3Forms (si está configurada la clave Web3Forms)
    if (!emailSent && web3FormsKey) {
      try {
        const w3fResponse = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: web3FormsKey,
            subject: `[Portfolio Contacto] ${cleanSubject}`,
            from_name: cleanEmail,
            email: cleanEmail,
            phone: cleanPhone,
            message: cleanMessage,
          }),
        });
        if (w3fResponse.ok) emailSent = true;
      } catch (err) {
        console.error('[Contact API] Excepción al llamar a Web3Forms:', err);
      }
    }

    // C) Envío vía Webhook genérico (si está configurado)
    if (!emailSent && webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: destinationEmail,
            subject: cleanSubject,
            email: cleanEmail,
            phone: cleanPhone,
            message: cleanMessage,
          }),
        });
        if (webhookResponse.ok) emailSent = true;
      } catch (err) {
        console.error('[Contact API] Excepción al llamar a Webhook:', err);
      }
    }

    // Log para desarrollo local
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Contact API] Mensaje procesado localmente:', {
        destination: destinationEmail,
        subject: cleanSubject,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMessage,
        emailSentReal: emailSent,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te responderé a la brevedad.',
      emailSentReal: emailSent,
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
