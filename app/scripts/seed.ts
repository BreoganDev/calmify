import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Empezando el seeding...');

  // Get credentials from environment variables
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD || 'ChangeThisPassword123!';
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin User';
  const userEmail = process.env.SEED_USER_EMAIL || 'user@example.com';
  const userPasswordPlain = process.env.SEED_USER_PASSWORD || 'ChangeThisPassword456!';
  const userName = process.env.SEED_USER_NAME || 'Test User';

  // Admin user
  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      name: adminName,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      password: adminPassword,
      emailVerified: new Date(),
    },
  });

  console.log('Administrador creado:', admin.email);

  // Standard user
  const userPassword = await bcrypt.hash(userPasswordPlain, 12);

  const standardUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: userPassword,
      name: userName,
      role: 'USER',
      emailVerified: new Date(),
    },
    create: {
      email: userEmail,
      name: userName,
      role: 'USER',
      password: userPassword,
      emailVerified: new Date(),
    },
  });

  console.log('Usuario creado/actualizado:', standardUser.email);

  // Categorias principales
  const podcastCategory = await prisma.category.upsert({
    where: { name: 'Podcasts' },
    update: {},
    create: {
      name: 'Podcasts',
      description: 'Conversaciones inspiradoras y contenido educativo sobre calma consciente',
      type: 'PODCAST',
      color: '#3B82F6',
      icon: 'Mic',
      canDelete: false,
    },
  });

  const meditationCategory = await prisma.category.upsert({
    where: { name: 'Meditaciones' },
    update: {},
    create: {
      name: 'Meditaciones',
      description: 'Practicas de mindfulness y meditacion para madres',
      type: 'MEDITATION',
      color: '#10B981',
      icon: 'Heart',
      canDelete: false,
    },
  });

  const hypnosisCategory = await prisma.category.upsert({
    where: { name: 'reconexión' },
    update: {},
    create: {
      name: 'reconexión',
      description: 'Sesiones de reconexión para relajacion profunda y bienestar',
      type: 'HYPNOSIS',
      color: '#8B5CF6',
      icon: 'Brain',
      canDelete: false,
    },
  });

  console.log('Categorias creadas');

  // Caratulas de ejemplo
  await Promise.all([
    prisma.cover.upsert({
      where: { id: 'cover-1' },
      update: {},
      create: {
        id: 'cover-1',
        filename: 'podcast-cover-1.jpg',
        originalName: 'calma consciente Cover',
        mimeType: 'image/jpeg',
        size: 150000,
        width: 400,
        height: 400,
        url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop&crop=center',
      },
    }),
    prisma.cover.upsert({
      where: { id: 'cover-2' },
      update: {},
      create: {
        id: 'cover-2',
        filename: 'meditation-cover-1.jpg',
        originalName: 'Meditacion Prenatal Cover',
        mimeType: 'image/jpeg',
        size: 160000,
        width: 400,
        height: 400,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      },
    }),
    prisma.cover.upsert({
      where: { id: 'cover-3' },
      update: {},
      create: {
        id: 'cover-3',
        filename: 'hypnosis-cover-1.jpg',
        originalName: 'Relajacion Profunda Cover',
        mimeType: 'image/jpeg',
        size: 140000,
        width: 400,
        height: 400,
        url: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=400&fit=crop&crop=center',
      },
    }),
  ]);

  console.log('Caratulas creadas');

  // Contenido de ejemplo
  const sampleAudios = [
    {
      title: 'Bienvenida a Maternidad en Calma',
      description: 'Un episodio introductorio sobre como encontrar la paz interior durante el embarazo y la maternidad.',
      duration: 1200,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 12000000,
      coverId: 'cover-1',
      categoryId: podcastCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 45,
    },
    {
      title: 'Conectando con tu bebe',
      description: 'Tecnicas de conexion emocional con tu bebe durante el embarazo.',
      duration: 900,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 9000000,
      coverId: 'cover-1',
      categoryId: podcastCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 32,
    },
    {
      title: 'Meditacion para el Primer Trimestre',
      description: 'Una meditacion guiada especialmente diseniada para las primeras etapas del embarazo.',
      duration: 1800,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 18000000,
      coverId: 'cover-2',
      categoryId: meditationCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 67,
    },
    {
      title: 'Respiracion Consciente para Madres',
      description: 'Aprende tecnicas de respiracion que te ayudaran en momentos de estres.',
      duration: 600,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 6000000,
      coverId: 'cover-2',
      categoryId: meditationCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 89,
    },
    {
      title: 'Relajacion Profunda para el Sueno',
      description: 'Una sesion de reconexión para ayudarte a descansar mejor durante el embarazo.',
      duration: 2400,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 24000000,
      coverId: 'cover-3',
      categoryId: hypnosisCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 23,
    },
    {
      title: 'Preparacion Mental para el Parto',
      description: 'reconexión para crear confianza y tranquilidad antes del gran dia.',
      duration: 1500,
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 15000000,
      coverId: 'cover-3',
      categoryId: hypnosisCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 56,
    },
  ];

  for (const audioData of sampleAudios) {
    await prisma.audio.upsert({
      where: { id: `audio-${audioData.title.toLowerCase().replace(/\\s+/g, '-')}` },
      update: {},
      create: {
        id: `audio-${audioData.title.toLowerCase().replace(/\\s+/g, '-')}`,
        ...audioData,
      },
    });
  }

  console.log('Contenido de audio creado');

  // Usuario de ejemplo
  const testUser = await prisma.user.upsert({
    where: { email: 'usuario@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario@ejemplo.com',
      name: 'Usuario Ejemplo',
      role: 'USER',
      password: await bcrypt.hash('usuario123', 12),
    },
  });

  console.log('Usuario de ejemplo creado');

  console.log('Seeding completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
