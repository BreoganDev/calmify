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

  const { sequenceId, subject, body, delayDays = 0, delayHours = 0, order = 0 } = await request.json();
  if (!sequenceId) return NextResponse.json({ error: 'sequenceId requerido' }, { status: 400 });

  const step = await prisma.emailSequenceStep.create({
    data: {
      sequenceId,
      subject: subject || 'Sin asunto',
      body: body || '',
      delayDays,
      delayHours,
      order,
    },
  });

  return NextResponse.json(step);
}

export async function PUT(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const body = await request.json();
  const step = await prisma.emailSequenceStep.update({
    where: { id },
    data: {
      subject: body.subject,
      body: body.body,
      delayDays: body.delayDays,
      delayHours: body.delayHours,
      order: body.order,
    },
  });

  return NextResponse.json(step);
}
