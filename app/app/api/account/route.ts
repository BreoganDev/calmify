import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Borrado en cascada manual (SQLite no cascades)
    await prisma.sequenceEnrollment.deleteMany({ where: { contact: { userId: user.id } } });
    await prisma.emailEvent.deleteMany({ where: { OR: [{ userId: user.id }, { contact: { userId: user.id } }] } });
    await prisma.scheduledAutomation.deleteMany({ where: { contact: { userId: user.id } } });
    await prisma.interaction.deleteMany({ where: { contact: { userId: user.id } } });
    await prisma.deal.deleteMany({ where: { contact: { userId: user.id } } });
    await prisma.contactTag.deleteMany({ where: { contact: { userId: user.id } } });
    await prisma.contact.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.favorite.deleteMany({ where: { userId: user.id } });
    await prisma.listen.deleteMany({ where: { userId: user.id } });
    await prisma.playlistItem.deleteMany({ where: { playlist: { userId: user.id } } });
    await prisma.playlist.deleteMany({ where: { userId: user.id } });
    await prisma.comment.deleteMany({ where: { userId: user.id } });
    await prisma.trackingEvent.deleteMany({ where: { userId: user.id } });

    await prisma.user.delete({ where: { id: user.id } });

    // Invalidar cookies NextAuth
    const cookieStore = cookies();
    cookieStore.set('next-auth.session-token', '', { maxAge: -1, path: '/' });
    cookieStore.set('__Secure-next-auth.session-token', '', { maxAge: -1, path: '/' });

    return NextResponse.json({ message: 'Cuenta eliminada' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar la cuenta' },
      { status: 500 }
    );
  }
}
