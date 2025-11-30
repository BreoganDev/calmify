import { prisma } from '@/lib/prisma';
import { ensureContact } from './crm';
import { sendCampaignEmail } from './email';
import { sendMetaCapiEvent } from './meta';

type EventPayload = {
  userId?: string;
  audioId?: string;
  metadata?: Record<string, any>;
};

export async function logEvent(type: string, payload: EventPayload = {}) {
  try {
    let contactId: string | undefined;
    let contactEmail: string | undefined;
    if (payload.userId) {
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user) {
        const contact = await ensureContact({ userId: user.id, email: user.email, name: user.name || undefined, role: user.role });
        contactId = contact?.id;
        contactEmail = contact?.email;
      }
    }

    const event = await prisma.trackingEvent.create({
      data: {
        type: type as any,
        userId: payload.userId,
        contactId,
        audioId: payload.audioId,
        metadata: payload.metadata,
      },
    });

    // Meta CAPI event
    sendMetaCapiEvent(type, {
      audioId: payload.audioId,
      userId: payload.userId,
      metadata: payload.metadata,
    });

    // Automatizaciones
    if (contactId && contactEmail) {
      const automations = await prisma.automation.findMany({
        where: { trigger: type as any, active: true },
        include: { template: true },
      });

      const now = new Date();

      const immediate = automations.filter((a: any) => a.delayMinutes === 0);
      const delayed = automations.filter((a: any) => a.delayMinutes > 0);

      // Inmediatas
      await Promise.allSettled(
        immediate.map((a: any) => {
          const subject = a.template?.subject || a.subject;
          const body = a.template?.body || a.body;
          return sendCampaignEmail(contactEmail!, subject, body);
        })
      );

      // Programadas
      if (delayed.length) {
        await prisma.scheduledAutomation.createMany({
          data: delayed.map((a: any) => ({
            automationId: a.id,
            contactId: contactId!,
            toEmail: contactEmail!,
            subject: a.template?.subject || a.subject,
            body: a.template?.body || a.body,
            dueAt: new Date(now.getTime() + a.delayMinutes * 60000),
          })),
        });
      }

      // Ejecutar pendientes vencidos (best-effort)
      await processDueAutomations();
    }

    return event;
  } catch (error) {
    console.warn('No se pudo registrar el evento', type, error);
    return null;
  }
}

export async function processDueAutomations() {
  const now = new Date();
  const due = await prisma.scheduledAutomation.findMany({
    where: {
      sentAt: null,
      dueAt: { lte: now },
    },
    take: 20,
  });

  if (!due.length) return;

  await Promise.allSettled(
    due.map(async (item: any) => {
      await sendCampaignEmail(item.toEmail, item.subject, item.body);
      await prisma.scheduledAutomation.update({
        where: { id: item.id },
        data: { sentAt: new Date() },
      });
    })
  );
}
