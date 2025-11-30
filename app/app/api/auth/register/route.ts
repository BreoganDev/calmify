
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail, sendAdminNewUserEmail, generateVerificationToken, sendVerificationEmail } from '@/lib/email';
import { logEvent } from '@/lib/analytics';
import { ensureContact } from '@/lib/crm';

export async function POST(request : Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (unverified by default)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    const { token, expires } = generateVerificationToken();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Crear contacto CRM antes de los envíos
    await ensureContact({ userId: user.id, email: user.email, name: user.name || undefined, role: user.role }).catch((err) => {
      console.warn('No se pudo crear contacto CRM', err);
    });

    // Enviar correos y registrar evento (tolerantes a fallo)
    await Promise.allSettled([
      sendWelcomeEmail(user.email, user.name || undefined),
      sendVerificationEmail(user.email, token),
      sendAdminNewUserEmail({ email: user.email, name: user.name || undefined }),
      (async () => {
        try {
          await logEvent('SIGNUP' as any, { userId: user.id, metadata: { email: user.email } });
        } catch (err) {
          console.warn('No se pudo registrar evento SIGNUP', err);
        }
      })(),
    ]);

    return NextResponse.json({
      message: 'Usuario creado. Revisa tu correo para confirmar la cuenta.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
