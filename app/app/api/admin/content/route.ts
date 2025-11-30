
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendContentPendingNotification } from '@/lib/email';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

function isAdminOrCollaborator(session: any) {
  return session && (session.user.role === 'ADMIN' || session.user.role === 'COLLABORATOR');
}

// GET /api/admin/content
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrCollaborator(session)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    const role = session!.user.role;
    const audios = await prisma.audio.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(audios);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/content
export async function POST(request : Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrCollaborator(session)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    const role = session!.user.role;

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const author = formData.get('author') as string || 'Calmify';
    const audioFile = formData.get('audioFile') as File;
    const coverFile = formData.get('coverFile') as File;

    if (!title || !categoryId || !audioFile) {
      return NextResponse.json(
        { error: 'Título, categoría y archivo de audio son requeridos' },
        { status: 400 }
      );
    }

    // Crear directorio uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Subir archivo de audio
    const audioBytes = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);
    const audioFilename = `audio_${Date.now()}_${audioFile.name}`;
    const audioPath = join(uploadsDir, audioFilename);
    await writeFile(audioPath, audioBuffer);

    let coverId = null;
    
    // Subir imagen de carátula si se proporciona
    if (coverFile) {
      const coverBytes = await coverFile.arrayBuffer();
      const coverBuffer = Buffer.from(coverBytes);
      const coverFilename = `cover_${Date.now()}_${coverFile.name}`;
      const coverPath = join(uploadsDir, coverFilename);
      await writeFile(coverPath, coverBuffer);

      // Crear registro de imagen en la base de datos
      const cover = await prisma.cover.create({
        data: {
          filename: coverFilename,
          originalName: coverFile.name,
          mimeType: coverFile.type,
          size: coverFile.size,
          width: 400,
          height: 400,
          url: `/uploads/${coverFilename}`,
        },
      });
      coverId = cover.id;
    }

    // Crear el audio en la base de datos
    const audio = await prisma.audio.create({
      data: {
        title,
        description,
        author,
        fileUrl: `/uploads/${audioFilename}`,
        fileSize: audioFile.size,
        coverId,
        categoryId,
        isPublished: role === 'ADMIN',
      },
      include: {
        category: true,
        cover: true,
      },
    });

    if (role === 'COLLABORATOR') {
      await sendContentPendingNotification({
        title,
        collaboratorEmail: session?.user?.email || undefined,
        author,
      });
    }

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content
export async function PUT(request : Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrCollaborator(session)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const author = formData.get('author') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverFile = formData.get('coverFile') as File;

    const updateData: any = {
      title,
      description,
      categoryId,
      author,
    };

    // Crear directorio uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Actualizar archivo de audio si se proporciona uno nuevo
    if (audioFile && audioFile.size > 0) {
      const audioBytes = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(audioBytes);
      const audioFilename = `audio_${Date.now()}_${audioFile.name}`;
      const audioPath = join(uploadsDir, audioFilename);
      await writeFile(audioPath, audioBuffer);
      
      updateData.fileUrl = `/uploads/${audioFilename}`;
      updateData.fileSize = audioFile.size;
    }

    // Actualizar imagen de carátula si se proporciona una nueva
    if (coverFile && coverFile.size > 0) {
      const coverBytes = await coverFile.arrayBuffer();
      const coverBuffer = Buffer.from(coverBytes);
      const coverFilename = `cover_${Date.now()}_${coverFile.name}`;
      const coverPath = join(uploadsDir, coverFilename);
      await writeFile(coverPath, coverBuffer);

      // Crear registro de imagen en la base de datos
      const cover = await prisma.cover.create({
        data: {
          filename: coverFilename,
          originalName: coverFile.name,
          mimeType: coverFile.type,
          size: coverFile.size,
          width: 400,
          height: 400,
          url: `/uploads/${coverFilename}`,
        },
      });
      updateData.coverId = cover.id;
    }

    if (session && session.user?.role === 'COLLABORATOR') {
      updateData.isPublished = false;
    }

    const audio = await prisma.audio.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        cover: true,
      },
    });

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content
export async function DELETE(request : Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      );
    }

    // Eliminar el audio y sus relaciones
    await prisma.audio.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
