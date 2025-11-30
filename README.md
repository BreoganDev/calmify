# Calmify - PWA de Podcasts, Meditaciones y reconexión

Aplicación web progresiva (PWA) para contenido de audio enfocado en calma consciente, meditación y reconexión.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14.2 (App Router)
- **Lenguaje:** TypeScript 5.2
- **Base de datos:** SQLite (desarrollo) / Prisma ORM
- **Autenticación:** NextAuth.js 4.24
- **Estilos:** Tailwind CSS + Shadcn/ui
- **Estado:** React Context + Zustand

## 📋 Prerequisitos

- Node.js 18+
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd calmify
```

2. **Instalar dependencias**
```bash
cd app
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura:
- `NEXTAUTH_SECRET`: Genera uno nuevo con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- Credenciales de seed (admin y usuario de prueba)

4. **Configurar base de datos**
```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de ejemplo
npx prisma db seed
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔐 Credenciales por Defecto

Después de ejecutar el seed, puedes iniciar sesión con:

- **Admin:** Las credenciales configuradas en `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`
- **Usuario:** Las credenciales configuradas en `SEED_USER_EMAIL` y `SEED_USER_PASSWORD`

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción.

## 📁 Estructura del Proyecto

```
calmify/
├── app/                    # Directorio principal de la aplicación
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── admin/        # Panel de administración
│   │   ├── auth/         # Páginas de autenticación
│   │   └── ...
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes Shadcn/ui
│   │   ├── audio/        # Componentes de audio
│   │   └── ...
│   ├── lib/              # Utilidades y configuración
│   │   ├── prisma.ts     # Cliente Prisma
│   │   ├── auth.ts       # NextAuth config
│   │   └── utils.ts
│   ├── prisma/
│   │   ├── schema.prisma # Esquema de base de datos
│   │   └── migrations/
│   └── scripts/
│       └── seed.ts       # Script de seeding
└── middleware.ts          # Next.js middleware (protección de rutas)
```

## 🎯 Funcionalidades Principales

### Usuarios
- ✅ Registro y autenticación
- ✅ Favoritos
- ✅ Historial de reproducción
- ✅ Playlists personalizadas
- ✅ Comentarios

### Administración
- ✅ Gestión de categorías
- ✅ Subida de contenido de audio
- ✅ Gestión de carátulas
- ✅ Publicación/despublicación de contenido
- ✅ Dashboard con estadísticas

### Contenido
- ✅ Podcasts
- ✅ Meditaciones
- ✅ reconexión
- ✅ Búsqueda y filtrado
- ✅ Categorización

## 🔨 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # Ejecutar ESLint
npx prisma studio    # Interfaz visual de BD
npx prisma migrate   # Gestión de migraciones
```

## ⚠️ Problemas Conocidos Resueltos

Este proyecto ha sido auditado y se han corregido los siguientes problemas críticos:

### Correcciones Técnicas
- ✅ Ruta hardcodeada de Prisma eliminada
- ✅ Imports de Prisma consolidados a `@/lib/prisma`
- ✅ Rutas API duplicadas eliminadas
- ✅ Contraseñas hardcodeadas movidas a variables de entorno
- ✅ `NEXTAUTH_SECRET` generado de forma segura
- ✅ Búsqueda case-insensitive corregida para SQLite
- ✅ Middleware movido al directorio correcto

### Mejoras de UI/UX
- ✅ **Sistema de Design Tokens** - Consistencia visual centralizada
- ✅ **Skeleton Screens** - 10 componentes de carga contextuales
- ✅ **Confirm Dialog** - Reemplazo moderno de window.confirm()
- ✅ **Navegación Activa** - Indicadores visuales de página actual
- ✅ **DeleteConfirmDialog Integrado** - 100% de window.confirm() reemplazados (3/3)
- ✅ **Skeleton Screens Integrados** - 4 de 6 páginas principales (Home, Categories, Favorites, Audio Detail)

### 🎨 Mejoras Visuales (NUEVO)
- ✅ **Hero Section Rediseñado** - Gradientes animados, efectos blob, stats bar con glassmorphism
- ✅ **Audio Cards Premium** - Hover effects 3D, play button mejorado, indicador de reproducción animado
- ✅ **Category Cards Premium** - Gradientes dinámicos, iconos animados, corner decorations
- ✅ **Header/Navbar Mejorado** - Navegación centrada, gradientes tricolor, indicadores activos
- ✅ **Footer Moderno** - Grid responsivo, social links, wave decoration, heart animation
- ✅ **Loading Spinner Premium** - Multi-layer con gradientes, glow effects, variants de tamaño
- ✅ **Playlists Page Premium** - Cards con 3D effects, corner decorations, gradient buttons
- ✅ **Audio Detail Page Premium** - Enhanced cover, gradient title, premium buttons, comment cards
- ✅ **Playlist Detail Page Premium** - Audio list items con estados, play buttons con gradientes
- ✅ **Category Detail Page Premium** - Animated hero con blobs, enhanced search/filters
- ✅ **Auth Page Premium** - Animated background, gradient card, enhanced inputs
- ✅ **Favorites Page Premium** - Animated hero con heart icon, blobs en tonos red/pink/rose
- ✅ **Admin Panel Premium** - Tabs con gradientes, cards premium, loading states, action buttons
- ✅ **Animaciones CSS** - Wave, blob, scale, rotate, translate effects
- ✅ **Glassmorphism Effects** - Backdrop blur en badges, botones y modales
- ✅ **Interactive Elements** - Feedback visual en todos los elementos hover/click
- ✅ **Empty States** - Estados vacíos con animaciones y CTAs con gradientes

📖 **Ver más:** [Documento de Mejoras UI/UX](./UI_UX_IMPROVEMENTS.md)

## 🚀 Despliegue a Producción

### Recomendaciones

1. **Base de datos:** Migrar de SQLite a PostgreSQL o MySQL
   ```bash
   # Actualiza DATABASE_URL en .env
   DATABASE_URL="postgresql://user:password@host:5432/calmify"
   ```

2. **Variables de entorno:** Asegúrate de configurar todas las variables en tu plataforma de hosting

3. **Seguridad:**
   - Genera un nuevo `NEXTAUTH_SECRET` único para producción
   - Cambia todas las credenciales de seed
   - Revisa permisos de archivos subidos
   - Implementa rate limiting
   - Habilita HTTPS

4. **Performance:**
   - Habilita optimización de imágenes de Next.js
   - Implementa caching (Redis recomendado)
   - Configura CDN para archivos estáticos

### Plataformas Recomendadas

- **Vercel** (recomendado para Next.js)
- **Railway**
- **Render**
- **DigitalOcean App Platform**

## 📝 Próximas Mejoras Recomendadas

### Alta Prioridad
- [ ] Implementar validación de archivos subidos (tipo, tamaño)
- [ ] Añadir rate limiting a endpoints críticos
- [ ] Implementar Zod para validación de requests
- [ ] Agregar manejo de errores específicos de Prisma
- [ ] Implementar error boundaries

### Media Prioridad
- [ ] Calcular duración real de archivos de audio
- [ ] Añadir paginación a todos los listados
- [ ] Implementar transacciones para operaciones críticas
- [ ] Eliminar covers huérfanas al actualizar
- [ ] Agregar logging estructurado

### Baja Prioridad
- [ ] Tests unitarios y de integración
- [ ] Soft deletes para datos importantes
- [ ] Campos de auditoría (createdBy, updatedBy)
- [ ] Documentación de API (OpenAPI/Swagger)
- [ ] Mejorar accesibilidad (WCAG AA)

## 📄 Licencia

breogandev.com - breogandeveloper@gmail.com

## 👥 Contribuciones

[Instrucciones para contribuir]

## 📧 Contacto

breogandev.com - breogandeveloper@gmail.com