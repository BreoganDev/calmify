/**
 * Skeleton Screen Components
 * Componentes de carga que muestran la estructura de la página mientras carga
 */

import { Skeleton } from '@/components/ui/skeleton';
import { gridCols, gridGap } from '@/lib/design-tokens';

// Skeleton para tarjeta de audio
export function AudioCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para grid de audio
export function AudioGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={`grid ${gridCols.audio} ${gridGap.normal}`}>
      {Array.from({ length: count }).map((_, i) => (
        <AudioCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para tarjeta de categoría
export function CategoryCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para grid de categorías
export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={`grid ${gridCols.categories} ${gridGap.normal}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para detalles de audio
export function AudioDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Skeleton className="w-64 h-64 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton para playlist
export function PlaylistSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-2">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para tabla de admin
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton genérico para páginas
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <AudioGridSkeleton />
    </div>
  );
}

// Skeleton para favoritos
export function FavoritesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <AudioGridSkeleton count={8} />
    </div>
  );
}

// Skeleton para home hero
export function HeroSkeleton() {
  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 py-16">
      <div className="container mx-auto px-4 space-y-4 text-center">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-[500px] mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
