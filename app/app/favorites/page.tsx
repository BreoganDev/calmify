
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AudioGrid } from '@/components/audio/audio-grid'
import { FavoritesSkeleton } from '@/components/ui/skeleton-screens'
import { Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFavoritesData(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      audio: {
        include: {
          cover: true,
          category: {
            include: {
              audios: false // Solo incluimos la categoría sin sus audios para evitar circular reference
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return favorites.map((favorite: any) => ({
    ...favorite.audio,
    category: {
      ...favorite.audio.category,
      audios: [] // Agregamos el array vacío para cumplir con el tipo Audio
    }
  }))
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth?callbackUrl=/favorites')
  }

  const favoriteAudios = await getFavoritesData(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="relative text-center py-16 mb-8 rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2))'
        }}>
          {/* Animated background blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex p-6 rounded-full mb-6 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
              <Heart className="h-16 w-16 text-red-500 fill-red-500 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mis Favoritos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Tu colección personal de contenido que te inspira, relaja y transforma. Todo tu contenido favorito en un solo lugar.
            </p>
          </div>
        </div>

        <Suspense fallback={<FavoritesSkeleton />}>
          <AudioGrid
            audios={favoriteAudios}
            emptyMessage="Aún no tienes contenido en favoritos. ¡Explora y guarda lo que más te guste!"
          />
        </Suspense>
      </div>
    </div>
  )
}
