
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/audio
export async function GET(request : Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');

    const where: any = {
      isPublished: true,
    };

    if (category) {
      where.category = {
        type: category.toUpperCase(),
      };
    }

    if (search) {
      // SQLite doesn't support case-insensitive mode in Prisma
      // Using contains without mode works case-insensitively by default in SQLite
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { author: { contains: search } },
      ];
    }

    const audios = await prisma.audio.findMany({
      where,
      include: {
        category: true,
        cover: true,
        _count: {
          select: {
            favorites: true,
            listenHistory: true,
          },
        },
      },
      orderBy: featured
        ? [{ listens: 'desc' }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(audios);
  } catch (error) {
    console.error('Error fetching audios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/audio (Admin only)
export async function POST(request : Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      duration,
      fileUrl,
      fileSize,
      coverId,
      categoryId,
      author,
      isPublished = false,
    } = await request.json();

    if (!title || !fileUrl || !categoryId) {
      return NextResponse.json(
        { error: 'Título, archivo de audio y categoría son requeridos' },
        { status: 400 }
      );
    }

    const audio = await prisma.audio.create({
      data: {
        title,
        description,
        duration,
        fileUrl,
        fileSize,
        coverId,
        categoryId,
        author,
        isPublished,
      },
      include: {
        category: true,
        cover: true,
      },
    });

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error creating audio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
