
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HomeContent } from '@/components/home/home-content'
import { HomeHero } from '@/components/home/home-hero'
import { HeroSkeleton, AudioGridSkeleton } from '@/components/ui/skeleton-screens'
import { NewsletterSignup } from '@/components/home/newsletter-signup'

export const dynamic = 'force-dynamic'

// Loading component mejorado para Home
function HomeLoadingState() {
  return (
    <div className="min-h-screen">
      <HeroSkeleton />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Featured section */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <AudioGridSkeleton count={6} />
        </div>
        {/* Recent section */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <AudioGridSkeleton count={8} />
        </div>
      </div>
    </div>
  )
}

async function getHomeData() {
  const [featuredAudios, categories, recentAudios] = await Promise.all([
    prisma.audio.findMany({
      where: { isPublished: true },
      include: {
        cover: true,
        category: true,
      },
      orderBy: { listens: 'desc' },
      take: 6,
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { audios: true }
        }
      }
    }),
    prisma.audio.findMany({
      where: { isPublished: true },
      include: {
        cover: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  return {
    featuredAudios,
    categories,
    recentAudios,
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const homeData = await getHomeData()

  return (
    <div className="min-h-screen">
      <HomeHero />
      <div className="mt-[-4rem] mb-12">
        <NewsletterSignup />
      </div>
      <Suspense fallback={<HomeLoadingState />}>
        <HomeContent
          {...homeData}
          session={session}
        />
      </Suspense>
    </div>
  )
}
