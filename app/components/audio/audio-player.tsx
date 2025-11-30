
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share,
  MoreHorizontal
} from 'lucide-react'
import { useAudio } from '@/contexts/audio-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Image from 'next/image'

export function AudioPlayer() {
  const { data: session } = useSession()
  const { state, dispatch, audioRef } = useAudio()
  const [isMuted, setIsMuted] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const { currentAudio, isPlaying, currentTime, duration, volume, isRepeat, isShuffle, playbackRate } = state

  useEffect(() => {
    if (currentAudio && session) {
      checkIfFavorite()
    }
  }, [currentAudio, session])

  const checkIfFavorite = async () => {
    if (!currentAudio || !session) return
    
    try {
      const response = await fetch(`/api/favorites?audioId=${currentAudio.id}`)
      const data = await response.json()
      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const togglePlayPause = () => {
    if (!session) {
      toast.error('Necesitas iniciar sesión para reproducir contenido')
      return
    }
    
    if (isPlaying) {
      dispatch({ type: 'PAUSE' })
    } else {
      dispatch({ type: 'PLAY' })
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      dispatch({ type: 'SET_CURRENT_TIME', payload: value[0] })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    dispatch({ type: 'SET_VOLUME', payload: value[0] / 100 })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    dispatch({ type: 'SET_VOLUME', payload: isMuted ? 1 : 0 })
  }

  const toggleFavorite = async () => {
    if (!session || !currentAudio) {
      toast.error('Necesitas iniciar sesión para guardar favoritos')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId: currentAudio.id })
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

  const shareAudio = async () => {
    if (!currentAudio) return

    const shareData = {
      title: currentAudio.title,
      text: `Escucha "${currentAudio.title}" en Calmify`,
      url: `${window.location.origin}/audio/${currentAudio.id}`
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!currentAudio) return null

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-40 rounded-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Album Art & Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
              {currentAudio.cover?.url ? (
                <Image
                  src={currentAudio.cover.url}
                  alt={currentAudio.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {currentAudio.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium truncate">{currentAudio.title}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentAudio.author} • {currentAudio.category?.name}
              </p>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className="h-8 w-8"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlayPause}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
                className={`h-8 w-8 ${isShuffle ? 'text-blue-500' : ''}`}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => dispatch({ type: 'PREVIOUS_TRACK' })}
                className="h-8 w-8"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlayPause}
                className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => dispatch({ type: 'NEXT_TRACK' })}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}
                className={`h-8 w-8 ${isRepeat ? 'text-blue-500' : ''}`}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className="h-8 w-8"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={shareAudio}
              className="h-8 w-8"
            >
              <Share className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 0.5 })}
                >
                  Velocidad 0.5x {playbackRate === 0.5 && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 0.75 })}
                >
                  Velocidad 0.75x {playbackRate === 0.75 && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 1 })}
                >
                  Velocidad Normal {playbackRate === 1 && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 1.25 })}
                >
                  Velocidad 1.25x {playbackRate === 1.25 && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 1.5 })}
                >
                  Velocidad 1.5x {playbackRate === 1.5 && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch({ type: 'SET_PLAYBACK_RATE', payload: 2 })}
                >
                  Velocidad 2x {playbackRate === 2 && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden mt-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
