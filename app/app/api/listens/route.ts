
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/listens
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const listens = await prisma.listen.findMany({
      where: { userId: session.user.id },
      include: {
        audio: {
          include: {
            category: true,
            cover: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(listens);
  } catch (error) {
    console.error('Error fetching listens:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/listens
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { audioId, progress = 0, completed = false } = await request.json();

    if (!audioId) {
      return NextResponse.json(
        { error: 'ID de audio requerido' },
        { status: 400 }
      );
    }

    // Increment listen count
    await prisma.audio.update({
      where: { id: audioId },
      data: { listens: { increment: 1 } },
    });

    // Track user listen if authenticated
    if (session) {
      const existingListen = await prisma.listen.findUnique({
        where: {
          userId_audioId: {
            userId: session.user.id,
            audioId,
          },
        },
      });

      if (existingListen) {
        // Update existing listen
        await prisma.listen.update({
          where: { id: existingListen.id },
          data: {
            progress,
            completed,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new listen
        await prisma.listen.create({
          data: {
            userId: session.user.id,
            audioId,
            progress,
            completed,
          },
        });
      }
    }

    return NextResponse.json({ message: 'Reproducción registrada' });
  } catch (error) {
    console.error('Error recording listen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
