
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Audio, Cover, Category } from '@prisma/client'
import { Play, Pause, Heart, Clock, Eye, ExternalLink, Share2, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAudio } from '@/contexts/audio-context'
import { LoginModal } from '@/components/auth/login-modal'
import { AddToPlaylistModal } from './add-to-playlist-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AudioWithDetails extends Audio {
  cover?: Cover | null
  category: Category
}

interface AudioCardProps {
  audio: AudioWithDetails
  showPlayButton?: boolean
  compact?: boolean
  className?: string
}

export function AudioCard({ 
  audio, 
  showPlayButton = true, 
  compact = false,
  className 
}: AudioCardProps) {
  const { data: session } = useSession()
  const { state, dispatch } = useAudio()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const isCurrentAudio = state.currentAudio?.id === audio.id
  const isPlaying = isCurrentAudio && state.isPlaying

  useEffect(() => {
    if (session?.user) {
      checkIfFavorite()
    }
  }, [session, audio.id])

  const checkIfFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites?audioId=${audio.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handlePlay = () => {
    if (!session) {
      setShowLoginModal(true)
      return
    }

    if (isCurrentAudio) {
      dispatch({ type: isPlaying ? 'PAUSE' : 'PLAY' })
    } else {
      dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio })
      dispatch({ type: 'PLAY' })
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session) {
      setShowLoginModal(true)
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId: audio.id })
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
        toast.success(isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        toast.error(errorData.error || 'Error al actualizar favoritos')
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
      toast.error('Error al actualizar favoritos')
    }
  }

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session) {
      setShowLoginModal(true)
      return
    }
    setShowPlaylistModal(true)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const shareData = {
      title: audio.title,
      text: `Escucha "${audio.title}" en Calmify`,
      url: `${window.location.origin}/audio/${audio.id}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Enlace copiado al portapapeles')
      } catch (error) {
        toast.error('No se pudo copiar el enlace')
      }
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      <Card className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        compact ? "h-auto" : "h-full",
        className
      )}>
        <CardContent className={cn("p-0", !compact && "pb-4")}>
          {/* Cover Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {audio.cover?.url ? (
              <Image
                src={audio.cover.url}
                alt={audio.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {audio.title.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Play Button Overlay */}
            {showPlayButton && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={handlePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: audio.category.color ? audio.category.color + '20' : undefined, 
                  color: audio.category.color || undefined 
                }}
              >
                {audio.category.name}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                className="h-8 w-8 bg-white/80 hover:bg-white rounded-md flex items-center justify-center transition-colors cursor-pointer"
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                )} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-white/80 hover:bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleAddToPlaylist}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar a playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className={cn("p-4", compact && "p-3")}>
            <Link href={`/audio/${audio.id}`}>
              <h3 className={cn(
                "font-semibold line-clamp-2 mb-2 hover:text-blue-600 transition-colors cursor-pointer",
                compact ? "text-sm" : "text-base"
              )}>
                {audio.title}
              </h3>
            </Link>
            
            {!compact && audio.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {audio.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(audio.duration)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3" />
                <span>{audio.listens}</span>
              </div>
            </div>

            {audio.author && !compact && (
              <p className="text-xs text-muted-foreground mt-2">
                Por {audio.author}
              </p>
            )}

            {/* Ver episodio button */}
            {!compact && (
              <div className="mt-3">
                <Link href={`/audio/${audio.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ver episodio
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        audioId={audio.id}
        audioTitle={audio.title}
      />
    </>
  )
}
