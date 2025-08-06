
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AudioGrid } from '@/components/audio/audio-grid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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

  return favorites.map(favorite => ({
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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold">Mis Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            Tu colección personal de contenido favorito
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <AudioGrid
            audios={favoriteAudios}
            emptyMessage="Aún no tienes contenido en favoritos. ¡Explora y guarda lo que más te guste!"
          />
        </Suspense>
      </div>
    </div>
  )
}
