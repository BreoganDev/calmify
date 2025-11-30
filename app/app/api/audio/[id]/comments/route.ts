
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/analytics';

export async function GET(
  request : Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { audioId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request : Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Contenido del comentario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el audio exista
    const audio = await prisma.audio.findUnique({
      where: { id: params.id },
    });

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio no encontrado' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        audioId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logEvent('COMMENT_CREATED' as any, {
      userId: user.id,
      audioId: params.id,
      metadata: { content: content.trim() },
    }).catch(() => {});

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request : Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json({ error: 'Falta commentId' }, { status: 400 });
    }

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { audioId: true },
    });

    if (!existing || existing.audioId !== params.id) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
