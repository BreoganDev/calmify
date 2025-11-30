
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request : Request) {
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

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request : Request) {
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

    const { name, description, isPublic } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nombre de la playlist requerido' },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
