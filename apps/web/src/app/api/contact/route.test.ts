import { beforeEach, describe, expect, it } from 'vitest';
import { clearRateLimitStore } from '@/lib/contact-security';
import { POST } from './route';

describe('POST /api/contact route handler', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it('accepts valid web contact payload including anti-bot ts and returns 200 OK', async () => {
    const request = new Request('http://localhost:3000/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        subject: 'prueba desde web +',
        email: 'j.nicob@gmail.com',
        phone: '672814490',
        message: 'prueba de que sigue funcionando',
        honeypot: '',
        ts: 1794397787598,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('returns 400 when required fields are invalid', async () => {
    const request = new Request('http://localhost:3000/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.2',
      },
      body: JSON.stringify({
        subject: 'Hi',
        email: 'invalid-email',
        phone: '',
        message: 'short',
        honeypot: '',
        ts: Date.now(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  it('silently returns 200 OK when honeypot is filled by a bot', async () => {
    const request = new Request('http://localhost:3000/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.3',
      },
      body: JSON.stringify({
        subject: 'Spam offer',
        email: 'bot@example.com',
        phone: '',
        message: 'Automated spam message content',
        honeypot: 'https://spambot.example',
        ts: Date.now(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
