import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processDueAutomations } from '@/lib/analytics';

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

  const automations = await prisma.automation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      scheduledRuns: { where: { sentAt: null }, orderBy: { dueAt: 'asc' }, take: 3 },
      template: true,
    },
  });
  return NextResponse.json(automations);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();

  // Acciones especiales
  if (body.action === 'runDue') {
    await processDueAutomations();
    return NextResponse.json({ ok: true });
  }

  const { name, trigger, delayMinutes = 0, subject, active = true, templateId } = body;
  const mailBody = body.body;

  if (!name || !trigger || !subject || !mailBody) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }

  if (!ALLOWED_TRIGGERS.includes(trigger)) {
    return NextResponse.json({ error: 'Trigger inválido' }, { status: 400 });
  }

  const automation = await prisma.automation.create({
    data: {
      name,
      trigger,
      delayMinutes,
      subject,
      body: mailBody,
      active,
      templateId: templateId || null,
    },
  });

  return NextResponse.json(automation);
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
  const trigger = body.trigger && ALLOWED_TRIGGERS.includes(body.trigger)
    ? body.trigger
    : undefined;

  const automation = await prisma.automation.update({
    where: { id },
    data: {
      name: body.name,
      subject: body.subject,
      body: body.body,
      delayMinutes: body.delayMinutes,
      active: body.active,
      trigger: trigger,
      templateId: body.templateId || null,
    },
    include: { scheduledRuns: true, template: true },
  });

  return NextResponse.json(automation);
}

export async function DELETE(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  await prisma.automation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
