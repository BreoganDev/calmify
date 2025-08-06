
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
import { Play, Pause, Heart, Share2, Clock, User, MessageCircle, ArrowLeft, Plus, List } from 'lucide-react';
import { Audio, Comment, Playlist } from '@/lib/types';
import { cn } from '@/lib/utils';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Audio no encontrado</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {/* Header del audio */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen de portada */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
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
              </div>
              
              {/* Información del audio */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">{audio.category.name}</Badge>
                  {audio.duration && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(audio.duration)}
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-2xl md:text-3xl mb-2">{audio.title}</CardTitle>
                
                {audio.author && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <User className="w-4 h-4 mr-2" />
                    {audio.author}
                  </div>
                )}
                
                {audio.description && (
                  <CardDescription className="text-base mb-4">
                    {audio.description}
                  </CardDescription>
                )}

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handlePlay} size="lg">
                    {state.currentAudio?.id === audio.id && state.isPlaying ? (
                      <Pause className="w-5 h-5 mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    {state.currentAudio?.id === audio.id && state.isPlaying ? 'Pausar' : 'Reproducir'}
                  </Button>
                  
                  {session?.user && (
                    <>
                      <Button variant="outline" onClick={handleFavorite}>
                        <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {isFavorite ? 'En favoritos' : 'Favorito'}
                      </Button>
                      
                      <Button variant="outline" onClick={() => setIsAddingToPlaylist(!isAddingToPlaylist)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar a playlist
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" onClick={handleShare}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
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
                  className="mb-3"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Publicar comentario
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 mb-6">Inicia sesión para comentar</p>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarFallback>
                      {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.user?.name || 'Usuario'}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
