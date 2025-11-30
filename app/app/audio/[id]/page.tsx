
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAudio } from '@/contexts/audio-context';
import { Play, Pause, Heart, Share2, Clock, User, MessageCircle, ArrowLeft, Plus, List, Trash2 } from 'lucide-react';
import { Audio, Comment, Playlist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AudioDetailSkeleton } from '@/components/ui/skeleton-screens';

const formatTime = (seconds: number | null) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function AudioPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const { state, dispatch } = useAudio();
  
  const [audio, setAudio] = useState<Audio | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAudio();
      fetchComments();
      if (session?.user) {
        checkFavoriteStatus();
        fetchUserPlaylists();
      }
    }
  }, [params.id, session]);

  const fetchAudio = async () => {
    try {
      const response = await fetch(`/api/audio/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAudio(data);
      } else {
        toast.error('No se pudo cargar el audio');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/audio/${params.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites?audioId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setUserPlaylists(data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handlePlay = () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para reproducir');
      router.push(`/auth?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    if (audio && state.currentAudio?.id === audio.id && state.isPlaying) {
      dispatch({ type: 'PAUSE' });
    } else if (audio) {
      dispatch({ type: 'SET_CURRENT_AUDIO', payload: audio });
      dispatch({ type: 'PLAY' });
    }
  };

  const handleFavorite = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId: params.id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al actualizar favoritos');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleShare = async () => {
    if (navigator.share && audio) {
      try {
        await navigator.share({
          title: audio.title,
          text: audio.description || 'Escucha este audio en Calmify',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Se copió el enlace al portapapeles');
    }
  };

  const handleAddComment = async () => {
    if (!session?.user || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/audio/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
        toast.success('Tu comentario se publicó correctamente');
      }
    } catch (error) {
      toast.error('Error al publicar comentario');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user || session.user.role !== 'ADMIN') return;

    try {
      const response = await fetch(`/api/audio/${params.id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        toast.success('Comentario eliminado');
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'No se pudo eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar comentario');
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId: params.id }),
      });

      if (response.ok) {
        toast.success('Se agregó el audio a tu playlist');
        setIsAddingToPlaylist(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al agregar a playlist');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  if (isLoading) {
    return <AudioDetailSkeleton />;
  }

  if (!audio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <Play className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Audio no encontrado
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Header del audio */}
        <Card className="mb-8 overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300 group relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32 transition-transform duration-500 group-hover:translate-x-24 group-hover:-translate-y-24">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          </div>

          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen de portada */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl overflow-hidden group/cover">
                  {audio.cover?.url ? (
                    <img
                      src={audio.cover.url}
                      alt={audio.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-110"
                    />
                  ) : (
                    <span className="relative z-10">{audio.title.charAt(0).toUpperCase()}</span>
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Información del audio */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800"
                  >
                    {audio.category.name}
                  </Badge>
                  {audio.duration && (
                    <Badge
                      variant="outline"
                      className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(audio.duration)}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl md:text-3xl mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {audio.title}
                </CardTitle>

                {audio.author && (
                  <div className="flex items-center text-muted-foreground mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mr-2">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium">{audio.author}</span>
                  </div>
                )}

                {audio.description && (
                  <CardDescription className="text-base mb-5 leading-relaxed">
                    {audio.description}
                  </CardDescription>
                )}

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {state.currentAudio?.id === audio.id && state.isPlaying ? (
                      <Pause className="w-5 h-5 mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2 fill-current" />
                    )}
                    {state.currentAudio?.id === audio.id && state.isPlaying ? 'Pausar' : 'Reproducir'}
                  </Button>

                  {session?.user && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleFavorite}
                        className={cn(
                          "hover:scale-110 transition-all duration-300",
                          isFavorite
                            ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                            : "hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700"
                        )}
                      >
                        <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-red-500 text-red-500")} />
                        {isFavorite ? 'En favoritos' : 'Favorito'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setIsAddingToPlaylist(!isAddingToPlaylist)}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110 transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar a playlist
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110 transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>

                {/* Lista de playlists */}
                {isAddingToPlaylist && session?.user && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Agregar a playlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userPlaylists.length > 0 ? (
                        <div className="space-y-2">
                          {userPlaylists.map((playlist) => (
                            <Button
                              key={playlist.id}
                              variant="outline"
                              className="justify-start w-full"
                              onClick={() => handleAddToPlaylist(playlist.id)}
                            >
                              <List className="w-4 h-4 mr-2" />
                              {playlist.name}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No tienes playlists aún</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Sección de comentarios */}
        <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
              Comentarios ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Agregar comentario */}
            {session?.user ? (
              <div className="mb-6">
                <Textarea
                  placeholder="Escribe tu comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 transition-all duration-300"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
                >
                  Publicar comentario
                </Button>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-muted-foreground text-center">Inicia sesión para comentar</p>
              </div>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Avatar className="ring-2 ring-purple-200 dark:ring-purple-800">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                      {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {comment.user?.name || 'Usuario'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {session?.user?.role === 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 ml-auto"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Borrar
                        </Button>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
                    <div className="relative h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    No hay comentarios aún. ¡Sé el primero en comentar!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
