
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

// GET - Obtener todo el contenido
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.audio.findMany({
      include: {
        category: true,
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Crear nuevo contenido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const audioFile = formData.get('audioFile') as File;
    if (!title || !categoryId || !audioFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Guardar archivo de audio
    const audioId = randomBytes(16).toString('hex');
    const audioExtension = path.extname(audioFile.name);
    const audioFileName = `audio_${audioId}${audioExtension}`;
    const audioPath = path.join(uploadDir, audioFileName);
    
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(audioPath, audioBuffer);

    // Obtener duración del audio (simplificado - en producción usar una librería como node-ffmpeg)
    const duration = 0; // Placeholder - implementar detección real de duración

    // Crear registro en la base de datos
    const content = await prisma.audio.create({
      data: {
        title,
        description,
        categoryId,
        fileUrl: `/uploads/${audioFileName}`,
        duration,
        isPublished: true,
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Actualizar contenido
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const audioFile = formData.get('audioFile') as File | null;

    const updateData: any = {
      title,
      description,
      categoryId,
    };

    // Actualizar audio si se proporciona
    if (audioFile && audioFile.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const audioId = randomBytes(16).toString('hex');
      const audioExtension = path.extname(audioFile.name);
      const audioFileName = `audio_${audioId}${audioExtension}`;
      const audioPath = path.join(uploadDir, audioFileName);
      
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      await writeFile(audioPath, audioBuffer);
      
      updateData.fileUrl = `/uploads/${audioFileName}`;
    }

    const content = await prisma.audio.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Eliminar contenido
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    // Eliminar favoritos relacionados primero
    await prisma.favorite.deleteMany({
      where: { audioId: id }
    });

    // Eliminar contenido
    await prisma.audio.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
