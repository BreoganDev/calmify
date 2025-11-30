import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/analytics';

// 1x1 pixel for email opens
export async function GET(request : Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // expected tracking id

  if (id) {
    const mailEvent = await prisma.emailEvent.findUnique({ where: { id } });
    if (mailEvent) {
      await prisma.emailEvent.update({
        where: { id },
        data: { openedAt: new Date() },
      });
      if (mailEvent.contactId) {
        logEvent('EMAIL_OPENED' as any as any, {
          userId: mailEvent.userId || undefined,
          metadata: { emailId: mailEvent.id, subject: mailEvent.subject },
        }).catch(() => {});
      }
    }
  }

  // return a 1x1 transparent pixel
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
    'base64'
  );

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
