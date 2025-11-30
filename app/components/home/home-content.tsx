
'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { AudioCard } from '@/components/audio/audio-card'
import { CategoryCard } from '@/components/categories/category-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Star } from 'lucide-react'
import Link from 'next/link'

type AudioWithDetails = {
  id: string
  title: string
  description?: string | null
  duration?: number | null
  listens?: number | null
  author?: string | null
  categoryId?: string | null
  cover?: { url?: string | null } | null
  category: { id?: string; name: string; color?: string | null }
  [key: string]: any
}

type CategoryWithCount = {
  id: string
  name: string
  description?: string | null
  type?: string | null
  color?: string | null
  _count: { audios: number }
}

interface HomeContentProps {
  featuredAudios: AudioWithDetails[]
  categories: CategoryWithCount[]
  recentAudios: AudioWithDetails[]
  session: Session | null
}

export function HomeContent({ 
  featuredAudios, 
  categories, 
  recentAudios, 
  session 
}: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredAudios = selectedCategory
    ? featuredAudios.filter(audio => audio.categoryId === selectedCategory)
    : featuredAudios

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Categorías</h2>
          <Button variant="ghost" asChild>
            <Link href="/categories">Ver todas</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
        </div>
      </section>

      {/* Featured Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold">Más Populares</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAudios.map((audio) => (
            <AudioCard 
              key={audio.id} 
              audio={audio} 
              showPlayButton={!!session}
            />
          ))}
        </div>
      </section>

      {/* Recent Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <h2 className="text-2xl font-bold">Recién Agregados</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentAudios.map((audio) => (
            <AudioCard 
              key={audio.id} 
              audio={audio} 
              showPlayButton={!!session}
              compact
            />
          ))}
        </div>
      </section>

      {/* Stats Card */}
      <section>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Estadísticas de Calmify</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {featuredAudios.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Episodios Disponibles
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Categorías
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {featuredAudios.reduce((sum, audio) => sum + (audio.listens || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Reproducciones
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {!session && (
        <section className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">
                ¿Listo para comenzar tu viaje?
              </h3>
              <p className="text-muted-foreground mb-6">
                Regístrate gratis y accede a todo nuestro contenido exclusivo
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/auth">Registrarse Gratis</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth">Ya tengo cuenta</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
