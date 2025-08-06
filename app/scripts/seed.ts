
import { PrismaClient, CategoryType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Empezando el seeding...');

  // Crear administrador inicial
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'diegofernandezgoas@gmail.com' },
    update: {},
    create: {
      email: 'diegofernandezgoas@gmail.com',
      name: 'Diego Fernández',
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });

  console.log('👤 Administrador creado:', admin.email);

  // Crear categorías principales
  const podcastCategory = await prisma.category.upsert({
    where: { name: 'Podcasts' },
    update: {},
    create: {
      name: 'Podcasts',
      description: 'Conversaciones inspiradoras y contenido educativo sobre maternidad consciente',
      type: CategoryType.PODCAST,
      color: '#3B82F6',
      icon: 'Mic',
      canDelete: false
    },
  });

  const meditationCategory = await prisma.category.upsert({
    where: { name: 'Meditaciones' },
    update: {},
    create: {
      name: 'Meditaciones',
      description: 'Prácticas de mindfulness y meditación para madres',
      type: CategoryType.MEDITATION,
      color: '#10B981',
      icon: 'Heart',
      canDelete: false
    },
  });

  const hypnosisCategory = await prisma.category.upsert({
    where: { name: 'Autohipnosis' },
    update: {},
    create: {
      name: 'Autohipnosis',
      description: 'Sesiones de autohipnosis para relajación profunda y bienestar',
      type: CategoryType.HYPNOSIS,
      color: '#8B5CF6',
      icon: 'Brain',
      canDelete: false
    },
  });

  console.log('📂 Categorías creadas');

  // Crear carátulas de ejemplo
  const covers = await Promise.all([
    prisma.cover.upsert({
      where: { id: 'cover-1' },
      update: {},
      create: {
        id: 'cover-1',
        filename: 'podcast-cover-1.jpg',
        originalName: 'Maternidad Consciente Cover',
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
        originalName: 'Meditación Prenatal Cover',
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
        originalName: 'Relajación Profunda Cover',
        mimeType: 'image/jpeg',
        size: 140000,
        width: 400,
        height: 400,
        url: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=400&fit=crop&crop=center',
      },
    }),
  ]);

  console.log('🖼️ Carátulas creadas');

  // Crear contenido de ejemplo
  const sampleAudios = [
    {
      title: 'Bienvenida a Maternidad en Calma',
      description: 'Un episodio introductorio sobre cómo encontrar la paz interior durante el embarazo y la maternidad.',
      duration: 1200, // 20 minutos
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // URL de ejemplo
      fileSize: 12000000,
      coverId: 'cover-1',
      categoryId: podcastCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 45,
    },
    {
      title: 'Conectando con tu bebé',
      description: 'Técnicas de conexión emocional con tu bebé durante el embarazo.',
      duration: 900, // 15 minutos
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 9000000,
      coverId: 'cover-1',
      categoryId: podcastCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 32,
    },
    {
      title: 'Meditación para el Primer Trimestre',
      description: 'Una meditación guiada especialmente diseñada para las primeras etapas del embarazo.',
      duration: 1800, // 30 minutos
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 18000000,
      coverId: 'cover-2',
      categoryId: meditationCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 67,
    },
    {
      title: 'Respiración Consciente para Madres',
      description: 'Aprende técnicas de respiración que te ayudarán en momentos de estrés.',
      duration: 600, // 10 minutos
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 6000000,
      coverId: 'cover-2',
      categoryId: meditationCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 89,
    },
    {
      title: 'Relajación Profunda para el Sueño',
      description: 'Una sesión de autohipnosis para ayudarte a descansar mejor durante el embarazo.',
      duration: 2400, // 40 minutos
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      fileSize: 24000000,
      coverId: 'cover-3',
      categoryId: hypnosisCategory.id,
      author: 'MEC Team',
      isPublished: true,
      listens: 23,
    },
    {
      title: 'Preparación Mental para el Parto',
      description: 'Autohipnosis para crear confianza y tranquilidad antes del gran día.',
      duration: 1500, // 25 minutos
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
      where: { id: `audio-${audioData.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `audio-${audioData.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...audioData,
      },
    });
  }

  console.log('🎵 Contenido de audio creado');

  // Crear usuario de ejemplo
  const testUser = await prisma.user.upsert({
    where: { email: 'usuario@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario@ejemplo.com',
      name: 'Usuario Ejemplo',
      role: Role.USER,
      password: await bcrypt.hash('usuario123', 12),
    },
  });

  console.log('👥 Usuario de ejemplo creado');

  console.log('✅ Seeding completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
