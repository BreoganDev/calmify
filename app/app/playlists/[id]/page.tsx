
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
import { formatTime, cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { state, dispatch } = useAudio();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para confirmación de eliminación
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const buildQueue = () =>
    (playlist?.items || [])
      .map((item) => item.audio)
      .filter((audio): audio is Audio => !!audio);

  const handlePlayAudio = (audio: Audio) => {
    const queue = buildQueue();
    const startIndex = queue.findIndex((item) => item.id === audio.id);

    dispatch({ type: 'SET_QUEUE', payload: { queue, startIndex: startIndex >= 0 ? startIndex : 0 } });
    dispatch({ type: 'PLAY' });
  };

  const handlePlayAll = () => {
    const queue = buildQueue();
    if (queue.length === 0) return;

    dispatch({ type: 'SET_QUEUE', payload: { queue, startIndex: 0 } });
    dispatch({ type: 'PLAY' });
  };

  const confirmRemoveFromPlaylist = async () => {
    if (!deleteItemId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/playlists/${params.id}/items/${deleteItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Audio eliminado',
          description: 'Se quitó el audio de la playlist',
        });
        fetchPlaylist();
        setDeleteItemId(null);
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
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando playlist..." />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <Music className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Playlist no encontrada
          </h1>
          <Button
            onClick={() => router.push('/playlists')}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis playlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <Button
          variant="ghost"
          onClick={() => router.push('/playlists')}
          className="mb-6 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Mis Playlists
        </Button>

        {/* Header de la playlist */}
        <Card className="mb-8 overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300 group relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32 transition-transform duration-500 group-hover:translate-x-24 group-hover:-translate-y-24">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          </div>

          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {playlist.name}
                  </CardTitle>
                  {playlist.isPublic ? (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
                  <CardDescription className="text-base mb-5 leading-relaxed">
                    {playlist.description}
                  </CardDescription>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/50 dark:bg-purple-900/20 backdrop-blur-sm">
                    <Music className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      {playlist.items?.length || 0} audios
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/50 dark:bg-pink-900/20 backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-sm font-medium text-pink-900 dark:text-pink-100">
                      {playlist.items?.reduce((total, item) => total + (item.audio?.duration || 0), 0)
                        ? formatTime(playlist.items.reduce((total, item) => total + (item.audio?.duration || 0), 0))
                        : '0:00'
                      } total
                    </span>
                  </div>
                </div>
              </div>

              {playlist.items && playlist.items.length > 0 && (
                <Button
                  onClick={handlePlayAll}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Reproducir todo
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Lista de audios */}
        {playlist.items && playlist.items.length > 0 ? (
          <div className="space-y-3">
            {playlist.items.map((item) => {
              if (!item.audio) return null;

              const audio = item.audio;
              const isCurrentAudio = state.currentAudio?.id === audio.id;
              const isAudioPlaying = isCurrentAudio && state.isPlaying;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-2",
                    isCurrentAudio
                      ? "border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20"
                      : "hover:border-purple-100 dark:hover:border-purple-900/30"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Botón de reproducir */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlayAudio(audio)}
                        className={cn(
                          "h-12 w-12 flex-shrink-0 transition-all duration-300",
                          isCurrentAudio
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-transparent hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 scale-110"
                            : "hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110"
                        )}
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                      </Button>

                      {/* Imagen/Cover */}
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md">
                        {audio.cover?.url ? (
                          <img
                            src={audio.cover.url}
                            alt={audio.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{audio.title.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Información del audio */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold truncate mb-1 transition-all duration-300",
                          isCurrentAudio
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                            : "text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        )}>
                          {audio.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {audio.category.name}
                          </Badge>
                          {audio.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(audio.duration)}
                            </span>
                          )}
                          {audio.author && (
                            <span className="truncate">Por {audio.author}</span>
                          )}
                        </div>
                      </div>

                      {/* Botón de eliminar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteItemId(item.id)}
                        className="flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:scale-110 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800">
            <CardContent className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
                <div className="relative h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Music className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Playlist vacía
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Esta playlist no tiene audios aún. Puedes agregar audios desde las páginas de contenido usando el botón "Agregar a playlist".
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Playlist Item Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        itemName={playlist?.items?.find(item => item.id === deleteItemId)?.audio?.title || ''}
        itemType="audio de la playlist"
        onConfirm={confirmRemoveFromPlaylist}
        loading={isDeleting}
      />
    </div>
  );
}
