
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request : Request,
  { params }: { params: { id: string; itemId: string } }
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

    // Verificar que el item existe en la playlist
    const playlistItem = await prisma.playlistItem.findFirst({
      where: {
        id: params.itemId,
        playlistId: params.id,
      },
    });

    if (!playlistItem) {
      return NextResponse.json(
        { error: 'Item no encontrado en la playlist' },
        { status: 404 }
      );
    }

    // Eliminar el item
    await prisma.playlistItem.delete({
      where: { id: params.itemId },
    });

    return NextResponse.json({ message: 'Item eliminado de la playlist' });
  } catch (error) {
    console.error('Error removing item from playlist:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
