import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const TAG_NAME = 'Suscriptor novedades';

export async function POST(req : Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const contact = await ensureContact({
      email: email.trim().toLowerCase(),
      name: name?.trim(),
      role: 'SUSCRIPTOR',
    });

    if (!contact) {
      return NextResponse.json({ error: 'No se pudo crear el contacto' }, { status: 500 });
    }

    const tag = await prisma.tag.upsert({
      where: { name: TAG_NAME },
      update: {},
      create: {
        name: TAG_NAME,
        description: 'Suscripción a novedades',
        color: '#a855f7',
      },
    });

    await prisma.contactTag.upsert({
      where: {
        contactId_tagId: {
          contactId: contact.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        contactId: contact.id,
        tagId: tag.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en newsletter subscribe', error);
    return NextResponse.json({ error: 'No se pudo procesar la suscripción' }, { status: 500 });
  }
}
