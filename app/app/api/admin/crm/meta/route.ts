import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ['META_PIXEL_ID', 'META_CAPI_ENABLED', 'META_ACCESS_TOKEN'] } },
  });
  const pixelId = settings.find((s: any) => s.key === 'META_PIXEL_ID')?.value || '';
  const capiEnabled = settings.find((s: any) => s.key === 'META_CAPI_ENABLED')?.value === 'true';
  const accessToken = settings.find((s: any) => s.key === 'META_ACCESS_TOKEN')?.value || '';

  return NextResponse.json({ pixelId, capiEnabled, accessToken });
}

export async function POST(request : Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { pixelId, capiEnabled, accessToken } = await request.json();

  await prisma.setting.upsert({
    where: { key: 'META_PIXEL_ID' },
    update: { value: pixelId || '' },
    create: { key: 'META_PIXEL_ID', value: pixelId || '' },
  });

  await prisma.setting.upsert({
    where: { key: 'META_CAPI_ENABLED' },
    update: { value: capiEnabled ? 'true' : 'false' },
    create: { key: 'META_CAPI_ENABLED', value: capiEnabled ? 'true' : 'false' },
  });

  if (accessToken !== undefined) {
    await prisma.setting.upsert({
      where: { key: 'META_ACCESS_TOKEN' },
      update: { value: accessToken || '' },
      create: { key: 'META_ACCESS_TOKEN', value: accessToken || '' },
    });
  }

  return NextResponse.json({ pixelId, capiEnabled, accessToken });
}
