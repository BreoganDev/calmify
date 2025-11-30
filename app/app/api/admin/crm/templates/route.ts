import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let templates = await prisma.emailTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  if (templates.length === 0) {
    const defaults = [
      {
        name: 'Bienvenida Premium',
        subject: 'Bienvenida a Calmify 🌸',
        category: 'Bienvenida',
        variables: { nombre: '', email: '' },
        body: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;padding:24px;font-family:'Inter',Arial,sans-serif;color:#111827;">
            <tr>
              <td align="center">
                <table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;padding:32px;box-shadow:0 15px 60px rgba(124,58,237,0.15);">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <img src="https://calmify.com.es/icon192x192.png" alt="Calmify" width="72" height="72" style="border-radius:16px;" />
                      <h1 style="margin:16px 0 0;font-size:28px;background:linear-gradient(90deg,#6366f1,#ec4899);-webkit-background-clip:text;color:transparent;">¡Hola {{nombre}}!</h1>
                      <p style="margin:8px 0 0;font-size:16px;color:#6b7280;">Gracias por unirte a Calmify. Hemos creado un espacio de calma y conexión solo para ti.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;line-height:1.6;color:#374151;">
                      <p><strong>Lo que encontrarás:</strong></p>
                      <ul style="padding-left:18px;margin:10px 0;">
                        <li>Sesiones seleccionadas para maternidad consciente.</li>
                        <li>Hipnosis guiadas y meditaciones premium.</li>
                        <li>Playlist curadas semanalmente.</li>
                      </ul>
                      <p style="margin-top:16px;">Comienza ahora y descubre tu próxima sesión favorita.</p>
                      <div style="margin:20px 0;">
                        <a href="https://calmify.com.es" style="display:inline-block;padding:12px 20px;background:linear-gradient(90deg,#6366f1,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:600;">Entrar a Calmify</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:24px;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;">
                      Enviado a {{email}} · Calmify · Madre consciente, mente en calma.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
      },
      {
        name: 'Confirmación de correo',
        subject: 'Confirma tu correo en Calmify',
        category: 'Onboarding',
        variables: { nombre: '', email: '', link_verificacion: '' },
        body: `
          <div style="background:#0f172a;padding:24px;font-family:'Inter',Arial,sans-serif;">
            <div style="max-width:620px;margin:0 auto;background:#0b1021;border:1px solid #1f2937;border-radius:16px;padding:28px;">
              <div style="text-align:center;margin-bottom:18px;">
                <img src="https://calmify.com.es/icon192x192.png" width="64" height="64" style="border-radius:12px;" />
                <h2 style="color:white;margin:12px 0 4px;font-size:24px;">Confirma tu correo</h2>
                <p style="color:#cbd5e1;margin:0;">Hola {{nombre}}, activa tu cuenta para empezar.</p>
              </div>
              <p style="color:#e5e7eb;font-size:15px;line-height:1.6;">Solo falta un paso para que puedas acceder a todo el contenido.</p>
              <div style="text-align:center;margin:22px 0;">
                <a href="{{link_verificacion}}" style="display:inline-block;padding:12px 20px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);color:white;text-decoration:none;border-radius:12px;font-weight:600;">Confirmar correo</a>
              </div>
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;">Si no solicitaste este registro, ignora este correo.</p>
            </div>
          </div>
        `,
      },
      {
        name: 'Novedades y lanzamientos',
        subject: 'Tu dosis semanal de calma ✨',
        category: 'Newsletter',
        variables: { nombre: '' },
        body: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7fb;padding:24px;font-family:'Inter',Arial,sans-serif;color:#111827;">
            <tr>
              <td align="center">
                <table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;padding:28px;box-shadow:0 10px 40px rgba(236,72,153,0.15);">
                  <tr>
                    <td style="text-align:left;">
                      <p style="margin:0 0 6px;font-size:14px;color:#ec4899;font-weight:700;">NOVEDADES CALMIFY</p>
                      <h2 style="margin:0 0 12px;font-size:26px;background:linear-gradient(90deg,#7c3aed,#ec4899);-webkit-background-clip:text;color:transparent;">Hola {{nombre}}, esto es lo nuevo</h2>
                      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px;">Te compartimos las novedades seleccionadas para ti esta semana.</p>
                      <ul style="padding-left:18px;margin:0;color:#374151;line-height:1.6;">
                        <li>3 meditaciones para dormir mejor.</li>
                        <li>Nueva sesión de hipnosis: “Calma en el día a día”.</li>
                        <li>Playlist de maternidad consciente actualizada.</li>
                      </ul>
                      <div style="margin:18px 0;">
                        <a href="https://calmify.com.es" style="display:inline-block;padding:12px 18px;background:linear-gradient(90deg,#7c3aed,#ec4899);color:white;text-decoration:none;border-radius:10px;font-weight:600;">Escuchar ahora</a>
                      </div>
                      <p style="font-size:12px;color:#9ca3af;">Si no deseas recibir estas novedades, puedes desuscribirte desde tu perfil.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
      },
    ];

    await prisma.emailTemplate.createMany({ data: defaults });
    templates = await prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  return NextResponse.json(templates);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, subject, body, category, variables, isDefault } = await request.json();
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }

  const template = await prisma.emailTemplate.create({
    data: {
      name,
      subject,
      body,
      category,
      variables,
      isDefault: !!isDefault,
    },
  });

  return NextResponse.json(template);
}

export async function PUT(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { name, subject, body, category, variables, isDefault } = await request.json();
  const template = await prisma.emailTemplate.update({
    where: { id },
    data: {
      name,
      subject,
      body,
      category,
      variables,
      isDefault: isDefault === undefined ? undefined : !!isDefault,
    },
  });

  return NextResponse.json(template);
}

export async function DELETE(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  await prisma.emailTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
