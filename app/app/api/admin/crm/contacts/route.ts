import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      deals: true,
      events: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, phone, role } = body;
  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const contact = await ensureContact({ email, name, role });
  if (contact && phone) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: { phone },
    });
  }

  return NextResponse.json(contact);
}
