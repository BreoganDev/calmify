import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Endpoint de prueba sin auth: envía un correo de bienvenida y muestra resultado
export async function GET(request : Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get('to');
  if (!to) return NextResponse.json({ error: 'Falta parámetro to' }, { status: 400 });

  try {
    await sendWelcomeEmail(to, 'Prueba bienvenida');
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    console.error('Error en envío de prueba sin auth', err);
    return NextResponse.json({ error: 'Fallo en envío', detail: `${err}` }, { status: 500 });
  }
}
