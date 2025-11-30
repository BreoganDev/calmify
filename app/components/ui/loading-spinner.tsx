import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  }

  const dotSizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-6 w-6',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/30" />

        {/* Animated gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-600 animate-spin" />

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse',
            dotSizeClasses[size]
          )} />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />
      </div>

      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loading component
export function LoadingPage({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Inline loading component
export function LoadingInline({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}
