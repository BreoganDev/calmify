
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CategoryCard } from '@/components/categories/category-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const dynamic = 'force-dynamic'

async function getCategoriesData() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { audios: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return { categories }
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  const { categories } = await getCategoriesData()

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Explora por Categorías</h1>
          <p className="text-muted-foreground">
            Descubre contenido organizado por temas para tu bienestar mental
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  )
}
