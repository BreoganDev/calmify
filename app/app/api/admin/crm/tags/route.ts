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

  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(tags);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, description, color } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  const tag = await prisma.tag.create({
    data: { name, description, color },
  });

  return NextResponse.json(tag);
}
