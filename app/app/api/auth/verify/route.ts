import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/analytics';
import { ensureContact } from '@/lib/crm';

export async function GET(request : Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification || verification.expires < new Date()) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: verification.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  const verifiedUser = await prisma.user.findUnique({ where: { email: verification.identifier } });
  if (verifiedUser) {
    logEvent('EMAIL_VERIFIED' as any, { userId: verifiedUser.id }).catch(() => {});
    ensureContact({ userId: verifiedUser.id, email: verifiedUser.email, name: verifiedUser.name || undefined, role: verifiedUser.role }).catch(() => {});
  }

  return NextResponse.json({ message: 'Correo verificado' });
}
