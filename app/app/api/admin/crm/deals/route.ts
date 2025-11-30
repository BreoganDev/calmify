import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const ALLOWED_STAGES = ['LEAD', 'ACTIVE', 'RISK', 'CHURN'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { contact: true, owner: true },
  });

  return NextResponse.json(deals);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { contactId, title, value, stage, ownerUserId, notes } = await request.json();
  if (!contactId || !title) {
    return NextResponse.json({ error: 'contactId y title son requeridos' }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      contactId,
      title,
      value,
      stage: ALLOWED_STAGES.includes(stage) ? stage : 'LEAD',
      ownerUserId,
      notes,
    },
    include: { contact: true, owner: true },
  });

  return NextResponse.json(deal);
}

export async function PUT(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const body = await request.json();
  const stageValue = body.stage && ALLOWED_STAGES.includes(body.stage) ? body.stage : undefined;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      title: body.title,
      value: body.value,
      notes: body.notes,
      ownerUserId: body.ownerUserId,
      stage: stageValue,
    },
    include: { contact: true, owner: true },
  });

  return NextResponse.json(deal);
}
