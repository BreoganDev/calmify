
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CategoryContent } from '@/components/category/category-content'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CategoryType } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: {
    id: string
  }
}

async function getCategoryData(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { audios: true }
        }
      }
    })

    if (!category) {
      return null
    }

    return { category }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession(authOptions)
  const data = await getCategoryData(params.id)

  if (!data) {
    notFound()
  }

  const { category } = data

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryContent 
          categoryType={category.type}
        />
      </Suspense>
    </div>
  )
}
