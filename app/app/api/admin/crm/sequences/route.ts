import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const ALLOWED_TRIGGERS = [
  'SIGNUP',
  'EMAIL_VERIFIED',
  'PLAY',
  'FAVORITE_ADDED',
  'COMMENT_CREATED',
  'FAVORITE_REMOVED',
  'PLAYLIST_CREATED',
  'EMAIL_OPENED',
  'LOGIN',
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const sequences = await prisma.emailSequence.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(sequences);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, description, trigger, active = true, steps = [] } = await request.json();
  if (!name || !trigger) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }
  if (!ALLOWED_TRIGGERS.includes(trigger)) {
    return NextResponse.json({ error: 'Trigger inv?lido' }, { status: 400 });
  }

  const sequence = await prisma.emailSequence.create({
    data: {
      name,
      description,
      trigger,
      active,
      steps: {
        create: steps.map((s: any, idx: number) => ({
          order: idx,
          delayDays: s.delayDays || 0,
          delayHours: s.delayHours || 0,
          subject: s.subject || 'Sin asunto',
          body: s.body || '',
        })),
      },
    },
    include: { steps: true },
  });

  return NextResponse.json(sequence);
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
  const trigger = body.trigger && ALLOWED_TRIGGERS.includes(body.trigger) ? body.trigger : undefined;

  const updated = await prisma.$transaction(async (tx: any) => {
    const seq = await tx.emailSequence.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        active: body.active,
        trigger: trigger,
      },
    });

    if (Array.isArray(body.steps)) {
      await tx.emailSequenceStep.deleteMany({ where: { sequenceId: id } });
      await tx.emailSequenceStep.createMany({
        data: body.steps.map((s: any, idx: number) => ({
          sequenceId: id,
          order: idx,
          delayDays: s.delayDays || 0,
          delayHours: s.delayHours || 0,
          subject: s.subject || 'Sin asunto',
          body: s.body || '',
        })),
      });
    }

    const withSteps = await tx.emailSequence.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    return withSteps;
  });

  return NextResponse.json(updated);
}
