
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, List, Music, Trash2, Edit, Lock, Globe } from 'lucide-react';
import { Playlist } from '@/lib/types';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function PlaylistsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  // Estados para confirmación de eliminación
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    
    if (session?.user) {
      fetchPlaylists();
    }
  }, [session, status, router]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las playlists',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la playlist es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingPlaylist ? `/api/playlists/${editingPlaylist.id}` : '/api/playlists';
      const method = editingPlaylist ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: editingPlaylist ? 'Playlist actualizada' : 'Playlist creada correctamente',
        });
        setIsDialogOpen(false);
        setEditingPlaylist(null);
        setFormData({ name: '', description: '', isPublic: false });
        fetchPlaylists();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Error al guardar la playlist',
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

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      isPublic: playlist.isPublic,
    });
    setIsDialogOpen(true);
  };

  const confirmDeletePlaylist = async () => {
    if (!deletePlaylistId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/playlists/${deletePlaylistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Playlist eliminada correctamente',
        });
        fetchPlaylists();
        setDeletePlaylistId(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Error al eliminar la playlist',
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

  const handleNewPlaylist = () => {
    setEditingPlaylist(null);
    setFormData({ name: '', description: '', isPublic: false });
    setIsDialogOpen(true);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando playlists..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mis Playlists
            </h1>
            <p className="text-muted-foreground mt-2">
              Organiza tu contenido favorito en listas personalizadas
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPlaylist} className="mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPlaylist ? 'Editar Playlist' : 'Nueva Playlist'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlaylist 
                    ? 'Modifica los detalles de tu playlist'
                    : 'Crea una nueva playlist para organizar tu contenido'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Mi playlist favorita"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe tu playlist..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                    <Label htmlFor="isPublic">Hacer playlist pública</Label>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPlaylist ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Playlists Grid */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="group relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-purple-950/20"
              >
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 transition-transform duration-300 group-hover:translate-x-4 group-hover:-translate-y-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
                </div>

                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {playlist.name}
                      </CardTitle>
                      {playlist.description && (
                        <CardDescription className="line-clamp-2 mt-1.5">
                          {playlist.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center shrink-0">
                      {playlist.isPublic ? (
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/50 dark:bg-purple-900/20 backdrop-blur-sm">
                      <Music className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        {playlist._count?.items || 0} audios
                      </span>
                    </div>
                    <Badge
                      variant={playlist.isPublic ? 'default' : 'secondary'}
                      className={playlist.isPublic ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : ''}
                    >
                      {playlist.isPublic ? 'Pública' : 'Privada'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-gradient-to-r hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300"
                      onClick={() => router.push(`/playlists/${playlist.id}`)}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110 transition-all duration-300"
                      onClick={() => handleEdit(playlist)}
                    >
                      <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletePlaylistId(playlist.id)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:scale-110 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>

                  {/* Bottom gradient line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              {/* Animated background circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
              <div className="relative h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <List className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              No tienes playlists aún
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Crea tu primera playlist para organizar tu contenido favorito y acceder rápidamente a tus audios preferidos
            </p>
            <Button
              onClick={handleNewPlaylist}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primera playlist
            </Button>
          </div>
        )}
      </div>

      {/* Delete Playlist Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletePlaylistId}
        onOpenChange={(open) => !open && setDeletePlaylistId(null)}
        itemName={playlists.find(p => p.id === deletePlaylistId)?.name || ''}
        itemType="playlist"
        onConfirm={confirmDeletePlaylist}
        loading={isDeleting}
      />
    </div>
  );
}
