
'use client'

import Link from 'next/link'
import { Category } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Heart, Brain, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

type CategoryWithCount = Category & {
  _count: { audios: number }
}

interface CategoryCardProps {
  category: CategoryWithCount
  className?: string
}

const iconMap = {
  Mic: Mic,
  Heart: Heart,
  Brain: Brain,
  Headphones: Headphones,
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Headphones

  return (
    <Link href={`/categories/${category.id}`}>
      <Card className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full",
        className
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: category.color ? category.color + '20' : undefined }}
            >
              <IconComponent 
                className="h-6 w-6" 
                style={{ color: category.color || undefined }}
              />
            </div>
            <Badge variant="secondary">
              {category._count.audios} episodios
            </Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {category.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
