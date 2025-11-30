
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Verificar que la playlist pertenece al usuario
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist no encontrada' },
        { status: 404 }
      );
    }

    const { audioId } = await request.json();

    if (!audioId) {
      return NextResponse.json(
        { error: 'ID del audio requerido' },
        { status: 400 }
      );
    }

    // Verificar que el audio existe
    const audio = await prisma.audio.findUnique({
      where: { id: audioId },
    });

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el item no está ya en la playlist
    const existingItem = await prisma.playlistItem.findFirst({
      where: {
        playlistId: params.id,
        audioId: audioId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'El audio ya está en la playlist' },
        { status: 409 }
      );
    }

    // Obtener el siguiente número de orden
    const lastItem = await prisma.playlistItem.findFirst({
      where: { playlistId: params.id },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastItem ? lastItem.order + 1 : 1;

    // Crear el item
    const playlistItem = await prisma.playlistItem.create({
      data: {
        playlistId: params.id,
        audioId: audioId,
        order: nextOrder,
      },
      include: {
        audio: {
          include: {
            cover: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(playlistItem, { status: 201 });
  } catch (error) {
    console.error('Error adding item to playlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Verificar que la playlist pertenece al usuario o es pública
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: user.id },
          { isPublic: true },
        ],
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist no encontrada' },
        { status: 404 }
      );
    }

    const playlistItems = await prisma.playlistItem.findMany({
      where: { playlistId: params.id },
      include: {
        audio: {
          include: {
            cover: true,
            category: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(playlistItems);
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
