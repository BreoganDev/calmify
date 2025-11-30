import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { contactId, tagId } = await request.json();
  if (!contactId || !tagId) {
    return NextResponse.json({ error: 'contactId y tagId requeridos' }, { status: 400 });
  }

  const contactTag = await prisma.contactTag.upsert({
    where: {
      contactId_tagId: {
        contactId,
        tagId,
      },
    },
    update: {},
    create: { contactId, tagId },
    include: { tag: true },
  });

  return NextResponse.json(contactTag);
}

export async function DELETE(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('contactId');
  const tagId = searchParams.get('tagId');
  if (!contactId || !tagId) {
    return NextResponse.json({ error: 'contactId y tagId requeridos' }, { status: 400 });
  }

  await prisma.contactTag.delete({
    where: {
      contactId_tagId: {
        contactId,
        tagId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
