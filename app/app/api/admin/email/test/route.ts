import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendWelcomeEmail, sendAdminNewUserEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  const to = url.searchParams.get('to');
  if (!to) return NextResponse.json({ error: 'Falta parámetro to' }, { status: 400 });

  try {
    await sendWelcomeEmail(to, 'Prueba Bienvenida');
    await sendAdminNewUserEmail({ email: to, name: 'Prueba' });
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    console.error('Error en envío de prueba', err);
    return NextResponse.json({ error: 'Fallo en envío', detail: `${err}` }, { status: 500 });
  }
}
