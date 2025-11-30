import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const [totals, recent, totalListens] = await Promise.all([
      prisma.trackingEvent.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.trackingEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { email: true, name: true } },
          audio: { select: { title: true } },
          contact: { select: { email: true, name: true } },
        },
      }),
      prisma.audio.aggregate({
        _sum: { listens: true },
      }),
    ]);

    return NextResponse.json({
      totals,
      recent,
      totalListens: totalListens._sum.listens || 0,
    });
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
