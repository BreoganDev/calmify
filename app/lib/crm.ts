import { prisma } from '@/lib/prisma';

export async function ensureContact(params: { userId?: string; email: string; name?: string; role?: string }) {
  try {
    if (!params.email) return null;

    const existingByUser = params.userId
      ? await prisma.contact.findFirst({ where: { userId: params.userId } })
      : null;
    const existingByEmail = await prisma.contact.findUnique({ where: { email: params.email } });

    if (existingByUser) {
      return prisma.contact.update({
        where: { id: existingByUser.id },
        data: {
          email: params.email,
          name: params.name ?? existingByUser.name,
          role: params.role ?? existingByUser.role,
        },
      });
    }

    if (existingByEmail) {
      return prisma.contact.update({
        where: { id: existingByEmail.id },
        data: {
          userId: params.userId ?? existingByEmail.userId,
          name: params.name ?? existingByEmail.name,
          role: params.role ?? existingByEmail.role,
        },
      });
    }

    return await prisma.contact.create({
      data: {
        email: params.email,
        name: params.name,
        role: params.role,
        userId: params.userId,
      },
    });
  } catch (error) {
    console.warn('No se pudo asegurar contacto CRM', error);
    return null;
  }
}
