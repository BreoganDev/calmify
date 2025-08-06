
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/audio-context';
import { ArrowLeft, Play, Pause, Trash2, Music, Clock, Globe, Lock } from 'lucide-react';
import { Playlist, Audio } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { state, dispatch } = useAudio();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    
    if (params.id && session?.user) {
      fetchPlaylist();
    }
  }, [params.id, session, status, router]);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
      } else if (response.status === 404) {
        toast({
          title: 'Playlist no encontrada',
          description: 'La playlist que buscas no existe o no tienes acceso a ella',
          variant: 'destructive',
        });
        router.push('/playlists');
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la playlist',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (audio: Audio) => {
    if (state.currentAudio?.id === audio.id && state.isPlaying) {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio });
      dispatch({ type: 'PLAY' });
    }
  };

  const handlePlayAll = () => {
    if (playlist?.items && playlist.items.length > 0) {
      const firstAudio = playlist.items[0].audio;
      if (firstAudio) {
        dispatch({ type: 'SET_CURRENT_AUDIO', payload: firstAudio });
        dispatch({ type: 'PLAY' });
      }
    }
  };

  const handleRemoveFromPlaylist = async (playlistItemId: string) => {
    if (!confirm('¿Estás seguro de que quieres quitar este audio de la playlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${params.id}/items/${playlistItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Audio eliminado',
          description: 'Se quitó el audio de la playlist',
        });
        fetchPlaylist();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Error al quitar el audio',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Playlist no encontrada</h1>
        <Button onClick={() => router.push('/playlists')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a mis playlists
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <Button variant="ghost" onClick={() => router.push('/playlists')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Mis Playlists
        </Button>

        {/* Header de la playlist */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{playlist.name}</CardTitle>
                  {playlist.isPublic ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Pública
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Privada
                    </Badge>
                  )}
                </div>
                
                {playlist.description && (
                  <CardDescription className="text-base mb-4">
                    {playlist.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center text-sm text-gray-600 gap-4">
                  <div className="flex items-center">
                    <Music className="w-4 h-4 mr-1" />
                    {playlist.items?.length || 0} audios
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {playlist.items?.reduce((total, item) => total + (item.audio?.duration || 0), 0) 
                      ? formatTime(playlist.items.reduce((total, item) => total + (item.audio?.duration || 0), 0))
                      : '0:00'
                    } total
                  </div>
                </div>
              </div>
              
              {playlist.items && playlist.items.length > 0 && (
                <Button onClick={handlePlayAll} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Reproducir todo
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Lista de audios */}
        {playlist.items && playlist.items.length > 0 ? (
          <div className="space-y-4">
            {playlist.items.map((item) => {
              if (!item.audio) return null;
              
              const audio = item.audio;
              const isCurrentAudio = state.currentAudio?.id === audio.id;
              const isAudioPlaying = isCurrentAudio && state.isPlaying;
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Botón de reproducir */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlayAudio(audio)}
                        className={isCurrentAudio ? 'bg-blue-50 border-blue-200' : ''}
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {/* Imagen/Cover */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {audio.cover?.url ? (
                          <img 
                            src={audio.cover.url} 
                            alt={audio.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          audio.title.charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      {/* Información del audio */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {audio.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 gap-3">
                          <span>{audio.category.name}</span>
                          {audio.duration && (
                            <>
                              <span>•</span>
                              <span>{formatTime(audio.duration)}</span>
                            </>
                          )}
                          {audio.author && (
                            <>
                              <span>•</span>
                              <span>Por {audio.author}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Botón de eliminar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromPlaylist(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Playlist vacía
              </h3>
              <p className="text-gray-600">
                Esta playlist no tiene audios aún. Puedes agregar audios desde las páginas de contenido.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
