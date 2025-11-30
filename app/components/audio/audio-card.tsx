'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
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

type AudioWithDetails = {
  id: string
  title: string
  fileUrl?: string
  description?: string | null
  duration?: number | null
  listens?: number | null
  author?: string | null
  cover?: { url?: string | null } | null
  category: { name: string; color?: string | null }
  [key: string]: any
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
        "group relative cursor-pointer overflow-hidden transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-2",
        "border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800",
        compact ? "h-auto" : "h-full",
        isCurrentAudio && "ring-2 ring-purple-500 shadow-lg shadow-purple-500/50",
        className
      )}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

        <CardContent className={cn("p-0 relative", !compact && "pb-4")}>
          {/* Cover Image */}
          <div className="relative aspect-square overflow-hidden">
            {audio.cover?.url ? (
              <div className="relative w-full h-full">
                <Image
                  src={audio.cover.url}
                  alt={audio.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-90"
                />
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white rounded-full blur-lg animate-pulse animation-delay-2000"></div>
                </div>
                <span className="text-white text-5xl font-bold relative z-10 drop-shadow-lg">
                  {audio.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Play Button Overlay - Enhanced */}
            {showPlayButton && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <Button
                  size="icon"
                  className={cn(
                    "h-16 w-16 rounded-full shadow-2xl transform transition-all duration-300",
                    "bg-white hover:bg-white text-purple-600",
                    "scale-75 group-hover:scale-100",
                    isPlaying && "bg-purple-600 text-white hover:bg-purple-700"
                  )}
                  onClick={handlePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>
            )}

            {/* Category Badge - Enhanced */}
            <div className="absolute top-3 left-3 z-20">
              <Badge
                className={cn(
                  "text-xs font-semibold backdrop-blur-md border-0 shadow-lg",
                  "transition-all duration-300 group-hover:scale-110"
                )}
                style={{
                  backgroundColor: audio.category.color ? audio.category.color + 'CC' : 'rgba(99, 102, 241, 0.8)',
                  color: '#ffffff'
                }}
              >
                {audio.category.name}
              </Badge>
            </div>

            {/* Action Buttons - Enhanced */}
            <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <button
                type="button"
                className={cn(
                  "h-9 w-9 rounded-full backdrop-blur-md shadow-lg",
                  "flex items-center justify-center transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  isFavorite
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/90 hover:bg-white"
                )}
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <Heart className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isFavorite ? "fill-white text-white scale-110" : "text-gray-700"
                )} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="backdrop-blur-md">
                  <DropdownMenuItem onClick={handleAddToPlaylist} className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar a playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Playing indicator */}
            {isCurrentAudio && (
              <div className="absolute bottom-3 left-3 z-20">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-600 shadow-lg">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-3 bg-white rounded-full animate-wave"></div>
                    <div className="w-1 h-4 bg-white rounded-full animate-wave animation-delay-100"></div>
                    <div className="w-1 h-3 bg-white rounded-full animate-wave animation-delay-200"></div>
                  </div>
                  <span className="text-white text-xs font-semibold ml-1">
                    {isPlaying ? 'Reproduciendo' : 'Pausado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content - Enhanced */}
          <div className={cn("p-4 relative z-10", compact && "p-3")}>
            <Link href={`/audio/${audio.id}`}>
              <h3 className={cn(
                "font-bold line-clamp-2 mb-2 transition-all duration-300",
                "group-hover:text-purple-600 dark:group-hover:text-purple-400",
                "cursor-pointer",
                compact ? "text-sm" : "text-lg"
              )}>
                {audio.title}
              </h3>
            </Link>

            {!compact && audio.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                {audio.description}
              </p>
            )}

            {/* Stats - Enhanced */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-medium">{formatDuration(audio.duration ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                <Eye className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium">{audio.listens}</span>
              </div>
            </div>

            {audio.author && !compact && (
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                Por <span className="text-purple-600 dark:text-purple-400">{audio.author}</span>
              </p>
            )}

            {/* Ver episodio button - Enhanced */}
            {!compact && (
              <div className="mt-3">
                <Link href={`/audio/${audio.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full font-semibold transition-all duration-300",
                      "border-2 group-hover:border-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-950",
                      "group-hover:text-purple-600 dark:group-hover:text-purple-400",
                      "transform group-hover:scale-105"
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
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
