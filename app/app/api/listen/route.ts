
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { audioId, progress = 0, completed = false } = await request.json()

  if (!audioId) {
    return NextResponse.json({ error: 'Audio ID required' }, { status: 400 })
  }

  try {
    // Update or create listen record
    const listen = await prisma.listen.upsert({
      where: {
        userId_audioId: {
          userId: session.user.id,
          audioId: audioId,
        },
      },
      update: {
        progress: Math.floor(progress),
        completed,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        audioId: audioId,
        progress: Math.floor(progress),
        completed,
      },
    })

    // Increment listen count if this is a new listen or completion
    if (completed || progress === 0) {
      await prisma.audio.update({
        where: { id: audioId },
        data: { listens: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true, listen })
  } catch (error) {
    console.error('Listen update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const audioId = searchParams.get('audioId')

  if (audioId) {
    // Get specific listen progress
    const listen = await prisma.listen.findUnique({
      where: {
        userId_audioId: {
          userId: session.user.id,
          audioId: audioId,
        },
      },
    })

    return NextResponse.json({ 
      progress: listen?.progress || 0,
      completed: listen?.completed || false 
    })
  }

  // Get user's listen history
  const listens = await prisma.listen.findMany({
    where: { userId: session.user.id },
    include: {
      audio: {
        include: {
          cover: true,
          category: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({ listens })
}
