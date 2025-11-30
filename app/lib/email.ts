import nodemailer, { type Transporter as NodemailerTransporter, type SentMessageInfo } from 'nodemailer';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

type Transporter = NodemailerTransporter<SentMessageInfo> | null;

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  ADMIN_NOTIFY_EMAIL,
} = process.env;

let transporter: Transporter = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    console.warn('SMTP settings missing, email sending disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    logger: true,
    debug: true,
    auth: SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });

  return transporter;
}

async function sendSafe(mail: any) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('No transporter available, skipping email to', mail.to);
    return;
  }

  const listUnsubscribe = SMTP_FROM ? `<mailto:${SMTP_FROM}>` : undefined;
  mail.headers = {
    ...(mail.headers || {}),
    ...(listUnsubscribe ? { 'List-Unsubscribe': listUnsubscribe, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : {}),
  };

  try {
    console.log('[email] Sending to', mail.to, 'subject:', mail.subject);
    const info = await transport.sendMail(mail);
    console.log('[email] Sent ok to', mail.to, 'response:', info?.response || info);
    return info;
  } catch (err) {
    console.error('Error sending email to', mail.to, err);
  }
}

export async function sendContentPendingNotification(params: { title: string; collaboratorEmail?: string; author?: string }) {
  const adminEmail = ADMIN_NOTIFY_EMAIL || SMTP_FROM;
  if (!adminEmail) {
    console.warn('Admin notification email missing, skipping content pending alert');
    return;
  }

  const collaborator = params.collaboratorEmail || 'Colaborador';
  const author = params.author || 'Calmify';

  await sendSafe({
    from: SMTP_FROM,
    to: adminEmail,
    subject: 'Nuevo contenido pendiente de revisión',
    text: `El colaborador ${collaborator} envió nuevo contenido para revisión.\n\nTítulo: ${params.title}\nAutor: ${author}\n\nIngresa al panel de admin para aprobarlo.`,
    html: `
      <p><strong>${collaborator}</strong> envió nuevo contenido para revisión.</p>
      <ul>
        <li><strong>Título:</strong> ${params.title}</li>
        <li><strong>Autor:</strong> ${author}</li>
      </ul>
      <p>Ingresa al panel de administración para aprobarlo.</p>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const safeName = name || 'Calmify';
  await sendSafe({
    from: SMTP_FROM,
    to,
    subject: '¡Bienvenida/o a Calmify!',
    text: `Hola ${safeName},\n\nGracias por registrarte en Calmify. Ya puedes acceder a tu cuenta y disfrutar del contenido.\n\n— Equipo Calmify`,
    html: `
      <p>Hola ${safeName},</p>
      <p>Gracias por registrarte en <strong>Calmify</strong>. Ya puedes acceder a tu cuenta y disfrutar del contenido.</p>
      <p>— Equipo Calmify</p>
    `,
  });
}

export async function sendAdminNewUserEmail(params: { email: string; name?: string }) {
  const adminEmail = ADMIN_NOTIFY_EMAIL || SMTP_FROM;
  if (!adminEmail) {
    console.warn('Admin notification email missing, skipping admin alert');
    return;
  }

  await sendSafe({
    from: SMTP_FROM,
    to: adminEmail,
    subject: 'Nuevo usuario registrado en Calmify',
    text: `Se registró un nuevo usuario.\n\nNombre: ${params.name || 'Sin nombre'}\nEmail: ${params.email}`,
    html: `
      <p>Se registró un nuevo usuario.</p>
      <ul>
        <li><strong>Nombre:</strong> ${params.name || 'Sin nombre'}</li>
        <li><strong>Email:</strong> ${params.email}</li>
      </ul>
    `,
  });
}

export function generateVerificationToken(): { token: string; expires: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  return { token, expires };
}

export async function sendCampaignEmail(to: string, subject: string, html: string, text?: string) {
  await sendSafe({
    from: SMTP_FROM,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ''),
    html,
  });
}

export async function buildTrackedEmail(to: string, subject: string, body: string, options?: { campaignId?: string; contactId?: string; userId?: string }) {
  const event = await prisma.emailEvent.create({
    data: {
      toEmail: to,
      subject,
      campaignId: options?.campaignId,
      contactId: options?.contactId,
      userId: options?.userId,
    },
  });

  const pixelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/open?id=${event.id}`;
  const htmlWithPixel = `${body}<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;" />`;

  return { event, htmlWithPixel };
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

  await sendSafe({
    from: SMTP_FROM,
    to,
    subject: 'Confirma tu correo en Calmify',
    text: `Gracias por registrarte en Calmify. Por favor confirma tu correo en el siguiente enlace:\n\n${verifyUrl}\n\nSi no creaste esta cuenta, ignora este mensaje.`,
    html: `
      <p>Gracias por registrarte en <strong>Calmify</strong>.</p>
      <p>Por favor confirma tu correo haciendo clic en el siguiente enlace:</p>
      <p><a href="${verifyUrl}" style="color:#7c3aed;font-weight:bold;">Confirmar mi correo</a></p>
      <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
    `,
  });
}
