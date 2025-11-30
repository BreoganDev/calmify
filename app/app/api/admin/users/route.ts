import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, email, password, role } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Email, password y role son requeridos' }, { status: 400 });
  }

  if (!['USER', 'ADMIN', 'COLLABORATOR'].includes(role)) {
    return NextResponse.json({ error: 'Role no válido' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || '',
      password: hashed,
      role,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PUT(request : Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const { name, email, password, role } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  }

  if (!['USER', 'ADMIN', 'COLLABORATOR'].includes(role)) {
    return NextResponse.json({ error: 'Role no válido' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  if (email && email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400 });
    }
  }

  const data: any = {
    name: name ?? existing.name,
    email: email ?? existing.email,
    role,
  };

  if (password) {
    data.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
