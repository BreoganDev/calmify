
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request : Request,
  { params }: { params: { id: string } }
) {
  try {
    const audio = await prisma.audio.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        cover: true,
        _count: {
          select: {
            favorites: true,
            listenHistory: true,
            comments: true,
          },
        },
      },
    });

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio no encontrado' },
        { status: 404 }
      );
    }

    // Solo mostrar contenido publicado para usuarios normales
    if (!audio.isPublished) {
      return NextResponse.json(
        { error: 'Audio no disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error fetching audio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
