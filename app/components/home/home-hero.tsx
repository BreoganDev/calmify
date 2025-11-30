'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Play, Heart, Brain, Sparkles, TrendingUp, Users, Music2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HomeHero() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          {/* Main Hero Content */}
          <div className="text-center mb-12">
            {/* Icon Badge */}
            <div className="mb-10 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-3xl group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center overflow-visible">
                  <Image
                    src="/icon-192x192.png"
                    alt="Calmify"
                    width={120}
                    height={120}
                    className="h-24 w-24 sm:h-28 sm:w-28 object-contain rounded-3xl shadow-2xl"
                    priority
                  />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>
                  <div className="absolute -left-4 top-11">
                    <Music2 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Encuentra tu{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Paz Interior
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4C50 0, 150 8, 200 4" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
              Tu compañero para una <strong>calma consciente</strong>. Descubre podcasts inspiradores,
              meditaciones profundas y sesiones de reconexión diseñadas especialmente para ti.
            </p>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
              {session ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <Link href="/categories">
                    <Play className="mr-2 h-6 w-6" />
                    Explorar Contenido
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto"
                    asChild
                  >
                    <Link href="/auth">
                      <Play className="mr-2 h-6 w-6" />
                      Empezar Ahora
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950 transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto backdrop-blur-sm bg-white/50 dark:bg-gray-900/50"
                    asChild
                  >
                    <Link href="/auth">
                      Iniciar Sesión
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats Bar */}
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-lg border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  100+ audios
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Miles de usuarios
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contenido nuevo semanal
                </span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-16">
            {/* Podcasts Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 p-8 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full"></div>

              <div className="mb-5 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 shadow-lg group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                  <Image src="/icon-192x192.png" alt="Calmify" width={48} height={48} className="h-10 w-10 object-contain" />
                </div>
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white text-center">
                Podcasts
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Conversaciones inspiradoras sobre calma consciente y crianza respetuosa
              </p>

              <div className="mt-4 flex justify-center">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  Explorar podcasts →
                </span>
              </div>
            </div>

            {/* Meditaciones Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 p-8 backdrop-blur-sm border border-green-100 dark:border-green-900 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>

              <div className="mb-5 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-lg group-hover:shadow-green-500/50 transition-shadow duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white text-center">
                Meditaciones
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Prácticas de mindfulness diseñadas para madres en todas las etapas
              </p>

              <div className="mt-4 flex justify-center">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 group-hover:underline">
                  Explorar meditaciones →
                </span>
              </div>
            </div>

            {/* reconexión Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 p-8 backdrop-blur-sm border border-purple-100 dark:border-purple-900 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full"></div>

              <div className="mb-5 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-4 shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white text-center">
                reconexión
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Relajación profunda y bienestar mental para tu viaje maternal
              </p>

              <div className="mt-4 flex justify-center">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:underline">
                  Explorar reconexión →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"/>
        </svg>
      </div>
    </section>
  )
}
