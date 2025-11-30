import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const ALLOWED_TYPES = ['NOTE', 'CALL', 'EMAIL'];

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { contactId, content, type, metadata } = await request.json();
  if (!contactId || !content) {
    return NextResponse.json({ error: 'contactId y content requeridos' }, { status: 400 });
  }

  const interaction = await prisma.interaction.create({
    data: {
      contactId,
      content,
      authorId: session.user.id,
      type: type && ALLOWED_TYPES.includes(type) ? type : 'NOTE',
      metadata,
    },
  });

  return NextResponse.json(interaction);
}
