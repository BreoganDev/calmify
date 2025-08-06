
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HomeContent } from '@/components/home/home-content'
import { HomeHero } from '@/components/home/home-hero'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const dynamic = 'force-dynamic'

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
      <Suspense fallback={<LoadingSpinner />}>
        <HomeContent 
          {...homeData}
          session={session}
        />
      </Suspense>
    </div>
  )
}
