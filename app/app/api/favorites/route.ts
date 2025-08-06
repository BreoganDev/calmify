
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const audioId = searchParams.get('audioId')

  if (audioId) {
    // Check if specific audio is favorited
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_audioId: {
          userId: session.user.id,
          audioId: audioId,
        },
      },
    })

    return NextResponse.json({ isFavorite: !!favorite })
  }

  // Get all user favorites
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      audio: {
        include: {
          cover: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ favorites })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { audioId } = await request.json()

  if (!audioId) {
    return NextResponse.json({ error: 'ID de audio requerido' }, { status: 400 })
  }

  try {
    // Verificar que el audio existe
    const audio = await prisma.audio.findUnique({
      where: { id: audioId }
    })

    if (!audio) {
      return NextResponse.json({ error: 'Audio no encontrado' }, { status: 404 })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        audioId: audioId,
      },
    })

    return NextResponse.json({ success: true, favorite })
  } catch (error: any) {
    console.error('Error creating favorite:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya está en favoritos' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { audioId } = await request.json()

  if (!audioId) {
    return NextResponse.json({ error: 'ID de audio requerido' }, { status: 400 })
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_audioId: {
          userId: session.user.id,
          audioId: audioId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json({ error: 'Favorito no encontrado' }, { status: 404 })
  }
}
