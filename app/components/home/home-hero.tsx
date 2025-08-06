
'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Play, Headphones, Heart, Brain } from 'lucide-react'
import Link from 'next/link'

export function HomeHero() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container relative mx-auto px-4 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <Headphones className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Bienvenida a{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calmify
            </span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Tu compañero para una maternidad consciente. Descubre podcasts inspiradores, 
            meditaciones profundas y sesiones de autohipnosis diseñadas especialmente para ti.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {session ? (
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                <Link href="/categories">
                  <Play className="mr-2 h-5 w-5" />
                  Explorar Contenido
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                  <Link href="/auth">
                    <Play className="mr-2 h-5 w-5" />
                    Empezar Ahora
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth">
                    Iniciar Sesión
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Podcasts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Conversaciones inspiradoras sobre maternidad consciente
              </p>
            </div>

            <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Meditaciones
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Prácticas de mindfulness para madres
              </p>
            </div>

            <div className="rounded-lg bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Autohipnosis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Relajación profunda y bienestar mental
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
