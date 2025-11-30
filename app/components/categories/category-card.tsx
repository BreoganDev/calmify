'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Heart, Brain, Headphones, ArrowRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type CategoryWithCount = {
  id: string
  name: string
  description?: string | null
  type?: string | null
  color?: string | null
  icon?: string | null
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
        "group relative cursor-pointer overflow-hidden transition-all duration-300 h-full",
        "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
        "border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800",
        className
      )}>
        {/* Gradient background overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${category.color || '#6366f1'}15 0%, transparent 100%)`
          }}
        />

        {/* Animated corner decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 transition-transform duration-300 group-hover:translate-x-8 group-hover:-translate-y-8">
          <div
            className="w-full h-full rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
        </div>

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between mb-4">
            {/* Icon with enhanced styling */}
            <div
              className={cn(
                "p-4 rounded-2xl transition-all duration-300 shadow-lg",
                "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl"
              )}
              style={{
                backgroundColor: category.color ? category.color + '20' : '#6366f120',
                boxShadow: `0 10px 30px -10px ${category.color || '#6366f1'}40`
              }}
            >
              <IconComponent
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                style={{ color: category.color || '#6366f1' }}
              />
            </div>

            {/* Badge with count */}
            <Badge
              className={cn(
                "backdrop-blur-md border-0 shadow-md font-semibold",
                "transition-all duration-300 group-hover:scale-110"
              )}
              style={{
                backgroundColor: category.color ? category.color + 'CC' : '#6366f1CC',
                color: '#ffffff'
              }}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {category._count.audios}
            </Badge>
          </div>

          {/* Title with gradient on hover */}
          <CardTitle className={cn(
            "text-xl font-bold transition-all duration-300 mb-2",
            "group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r"
          )}
          style={{
            backgroundImage: `linear-gradient(to right, ${category.color || '#6366f1'}, ${category.color || '#a855f7'})`
          }}>
            {category.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 relative z-10">
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
              {category.description}
            </p>
          )}

          {/* Explore link with arrow */}
          <div className="flex items-center text-sm font-semibold transition-all duration-300 group-hover:translate-x-2"
            style={{ color: category.color || '#6366f1' }}
          >
            <span>Explorar</span>
            <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>

        {/* Bottom gradient line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{
            background: `linear-gradient(to right, ${category.color || '#6366f1'}, ${category.color || '#a855f7'})`
          }}
        />
      </Card>
    </Link>
  )
}
