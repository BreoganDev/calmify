import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const audio = await prisma.audio.update({
      where: { id },
      data: {
        isPublished: true,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        cover: true,
      },
    });

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error approving content:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
