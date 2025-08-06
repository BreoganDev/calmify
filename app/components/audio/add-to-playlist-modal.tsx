
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, List } from 'lucide-react'
import { toast } from 'sonner'
import { Playlist } from '@/lib/types'

interface AddToPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  audioId: string
  audioTitle: string
}

export function AddToPlaylistModal({ 
  isOpen, 
  onClose, 
  audioId, 
  audioTitle 
}: AddToPlaylistModalProps) {
  const { data: session } = useSession()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchPlaylists()
    }
  }, [isOpen, session])

  const fetchPlaylists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/playlists')
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      toast.error('Error al cargar playlists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId })
      })

      if (response.ok) {
        toast.success(`Agregado a "${playlistName}"`)
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al agregar a playlist')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar a playlist</DialogTitle>
          <DialogDescription>
            Selecciona una playlist para agregar "{audioTitle}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-60">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                >
                  <List className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{playlist.name}</div>
                    {playlist.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {playlist.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {playlist._count?.items || 0} elementos
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tienes playlists aún</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                <Plus className="h-4 w-4 mr-2" />
                Crear playlist
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
