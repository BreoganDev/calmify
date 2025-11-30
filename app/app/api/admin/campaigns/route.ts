import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendCampaignEmail, buildTrackedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { name, subject, body, sendNow = false, testEmail, templateId } = await request.json();
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      subject,
      body,
      status: sendNow ? 'SENT' : 'DRAFT',
      templateId: templateId || null,
    },
  });

  // Enviar test aunque la campaña quede en borrador
  if (testEmail) {
    try {
      const { htmlWithPixel } = await buildTrackedEmail(testEmail, subject, body, {
        campaignId: campaign.id,
        contactId: undefined,
      });
      await sendCampaignEmail(testEmail, subject, htmlWithPixel);
    } catch (error) {
      console.warn('Error enviando test campaign email', error);
    }
  }

  if (sendNow) {
    // Destinatarios: usuarios con email verificado
    const users = await prisma.user.findMany({
      where: { emailVerified: { not: null } },
      select: { email: true, name: true },
    });

    const recipients: { email: string; name?: string | null }[] = testEmail ? [{ email: testEmail }] : users;

    await Promise.allSettled(
      recipients.map(async (u: { email: string; name?: string | null }) => {
        const { htmlWithPixel } = await buildTrackedEmail(u.email, subject, body, {
          campaignId: campaign.id,
          contactId: undefined,
        });
        return sendCampaignEmail(
          u.email,
          subject,
          htmlWithPixel,
        );
      })
    );

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        recipients: recipients.length,
        status: 'SENT',
      },
    });
  }

  return NextResponse.json(campaign);
}
