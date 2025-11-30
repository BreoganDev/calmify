
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Upload, BarChart2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AudioContent, Category, User } from '@/lib/types';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [audioContent, setAudioContent] = useState<AudioContent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<AudioContent | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const role = session?.user?.role;
  const isAdmin = role === 'ADMIN';
  const isCollaborator = role === 'COLLABORATOR';

  // Estados para confirmación de eliminación
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || (!isAdmin && !isCollaborator)) {
      redirect('/');
    }
  }, [session, status, isAdmin, isCollaborator]);

  // Cargar datos cuando el rol est� listo y es permitido
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || (!isAdmin && !isCollaborator)) return;
    fetchData();
  }, [status, session, isAdmin, isCollaborator]);

  const fetchData = async () => {
    try {
      const requests = [
        fetch('/api/admin/content'),
        fetch('/api/categories'),
      ];
      if (isAdmin) {
        requests.push(fetch('/api/admin/users'));
      }
      const [contentRes, categoriesRes, usersRes] = await Promise.all(requests as any);
      
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setAudioContent(contentData);
      }
      
      if (categoriesRes?.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (isAdmin && usersRes?.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentSubmit = async (formData: FormData) => {
    try {
      const url = editingContent 
        ? `/api/admin/content?id=${editingContent.id}`
        : '/api/admin/content';
        
      const method = editingContent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Contenido ${editingContent ? 'actualizado' : 'creado'} correctamente`
        });
        fetchData();
        setIsContentDialogOpen(false);
        setEditingContent(null);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al guardar el contenido",
        variant: "destructive"
      });
    }
  };

  const handleApproveContent = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await fetch(`/api/admin/content/publish?id=${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error('No se pudo aprobar el contenido');
      toast({
        title: 'Contenido aprobado',
        description: 'El contenido ya está publicado',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aprobar',
        variant: 'destructive',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const confirmDeleteContent = async () => {
    if (!deleteContentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/content?id=${deleteContentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Contenido eliminado correctamente"
        });
        fetchData();
        setDeleteContentId(null);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories?id=${editingCategory.id}`
        : '/api/admin/categories';
        
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          type: formData.get('type'),
          color: formData.get('color'),
        })
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Categoría ${editingCategory ? 'actualizada' : 'creada'} correctamente`
        });
        fetchData();
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al guardar la categoría",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories?id=${deleteCategoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Categoría eliminada correctamente"
        });
        fetchData();
        setDeleteCategoryId(null);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" />
            <div className="relative h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-spin">
              <div className="h-12 w-12 rounded-full bg-background" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="relative text-center py-16 mb-8 rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.2))'
        }}>
          {/* Animated background blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex p-6 rounded-full mb-6 shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <svg className="h-16 w-16 text-indigo-600 dark:text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Gestiona el contenido y categorías de Calmify. Crea, edita y organiza todo el contenido de la plataforma.
            </p>
          </div>
        </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-1 border-2 border-purple-200 dark:border-purple-800">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
          >
            Contenido de Audio
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
              >
                Categorías
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
              >
                Usuarios
              </TabsTrigger>
              <a
                href="/admin/analytics"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-purple-700 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                CRM / Métricas
              </a>
            </>
          )}
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Contenido de Audio</h2>
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingContent(null)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingContent ? 'Editar Contenido' : 'Agregar Nuevo Contenido'}
                  </DialogTitle>
                  <DialogDescription>
                    Completa la información del audio. Los envíos de colaboradores quedan pendientes hasta que un admin los apruebe.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <ContentForm 
                    content={editingContent}
                    categories={categories}
                    onSubmit={handleContentSubmit}
                    onCancel={() => {
                      setIsContentDialogOpen(false);
                      setEditingContent(null);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {audioContent.map((content) => (
              <Card
                key={content.id}
                className="group relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-purple-950/20"
              >
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 transition-transform duration-300 group-hover:translate-x-4 group-hover:-translate-y-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
                </div>

                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      {content.cover?.url && (
                        <div className="relative group/cover">
                          <img
                            src={content.cover.url}
                            alt={`Carátula de ${content.title}`}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-md group-hover/cover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {content.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2">{content.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800"
                          >
                            {content.category.name}
                          </Badge>
                          {!content.isPublished && (
                            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300">
                              Pendiente de revisión
                            </Badge>
                          )}
                          {content.author && (
                            <span className="text-sm text-muted-foreground">por {content.author}</span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : 'Duración desconocida'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isAdmin && !content.isPublished && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveContent(content.id)}
                          disabled={approvingId === content.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {approvingId === content.id ? 'Aprobando...' : 'Aprobar'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingContent(content);
                          setIsContentDialogOpen(true);
                        }}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteContentId(content.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:scale-110 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Categorías</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingCategory(null)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                  </DialogTitle>
                  <DialogDescription>
                    Define el nombre, tipo y color para organizar el contenido.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      defaultValue={editingCategory?.name}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      defaultValue={editingCategory?.description || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" defaultValue={editingCategory?.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PODCAST">Podcast</SelectItem>
                        <SelectItem value="MEDITATION">Meditación</SelectItem>
                        <SelectItem value="HYPNOSIS">Hipnosis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input 
                      id="color" 
                      name="color" 
                      type="color"
                      defaultValue={editingCategory?.color || '#3B82F6'}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group relative overflow-hidden border-2 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-purple-950/20"
              >
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 transition-transform duration-300 group-hover:translate-x-4 group-hover:-translate-y-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
                </div>

                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-purple-200 dark:border-purple-800 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                        <Badge
                          variant="outline"
                          className="mt-2 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50"
                        >
                          {category.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-110 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:scale-110 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        )}

        {isAdmin && (
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Usuarios
            </h2>
            <Badge variant="outline" className="bg-white/60 dark:bg-gray-900/60">
              {users.length} usuarios
            </Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-purple-100 dark:border-purple-900/50 bg-card shadow-sm p-4 space-y-4">
              <h3 className="text-lg font-semibold">Crear usuario</h3>
              <div className="space-y-3">
                <input
                  className="w-full rounded-lg border border-purple-200 dark:border-purple-800 bg-background px-3 py-2"
                  placeholder="Nombre"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border border-purple-200 dark:border-purple-800 bg-background px-3 py-2"
                  placeholder="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border border-purple-200 dark:border-purple-800 bg-background px-3 py-2"
                  placeholder="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
                <select
                  className="w-full rounded-lg border border-purple-200 dark:border-purple-800 bg-background px-3 py-2"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="USER">Usuario</option>
                  <option value="COLLABORATOR">Colaborador</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button
                  onClick={async () => {
                    try {
                      const method = editingUser ? 'PUT' : 'POST';
                      const url = editingUser ? `/api/admin/users?id=${editingUser.id}` : '/api/admin/users';
                      const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userForm),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Error al guardar usuario');
                      toast({
                        title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
                        description: `${data.email} (${data.role})`,
                      });
                      setUserForm({ name: '', email: '', password: '', role: 'USER' });
                      setEditingUser(null);
                      fetchData();
                    } catch (err: any) {
                      toast({
                        title: 'Error',
                        description: err.message || 'No se pudo guardar el usuario',
                        variant: 'destructive',
                      });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white"
                >
                  {editingUser ? 'Actualizar usuario' : 'Crear usuario'}
                </Button>
                {editingUser && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: '', email: '', password: '', role: 'USER' });
                    }}
                  >
                    Cancelar edición
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:col-span-2 overflow-hidden rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
              <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 text-sm font-semibold text-purple-900 dark:text-purple-100 border-b border-purple-100 dark:border-purple-900/50">
                <span>Nombre</span>
                <span>Email</span>
                <span>Rol</span>
                <span>Creado</span>
                <span>Actualizado</span>
                <span>Acciones</span>
              </div>
              <div className="divide-y divide-purple-100 dark:divide-purple-900/50">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="grid md:grid-cols-6 gap-2 md:gap-4 px-4 py-3 items-center bg-white dark:bg-gray-950/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{user.name || 'Sin nombre'}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                      </div>
                    </div>
                    <div className="hidden md:block text-muted-foreground truncate">{user.email}</div>
                    <div>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user);
                          setUserForm({
                            name: user.name || '',
                            email: user.email,
                            password: '',
                            role: user.role,
                          });
                        }}
                        className="hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
                    No hay usuarios para mostrar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        )}
      </Tabs>

      {/* Delete Content Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteContentId}
        onOpenChange={(open) => !open && setDeleteContentId(null)}
        itemName={audioContent.find(c => c.id === deleteContentId)?.title || ''}
        itemType="contenido"
        onConfirm={confirmDeleteContent}
        loading={isDeleting}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
        itemName={categories.find(c => c.id === deleteCategoryId)?.name || ''}
        itemType="categoría"
        onConfirm={confirmDeleteCategory}
        loading={isDeleting}
      />
    </div>
    </div>
  );
}

function ContentForm({ 
  content, 
  categories, 
  onSubmit,
  onCancel
}: { 
  content: AudioContent | null;
  categories: Category[];
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={content?.title}
          placeholder="Título del contenido"
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description" 
          name="description"
          defaultValue={content?.description || ''}
          placeholder="Descripción del contenido"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="author">Autor</Label>
        <Input 
          id="author" 
          name="author" 
          defaultValue={content?.author || 'Calmify'}
          placeholder="Nombre del autor"
        />
      </div>
      
      <div>
        <Label htmlFor="categoryId">Categoría *</Label>
        <Select name="categoryId" defaultValue={content?.categoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 && (
              <SelectItem value="no-categories" disabled>
                No hay categor?as disponibles
              </SelectItem>
            )}
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="coverFile">Imagen de Carátula</Label>
        <Input 
          id="coverFile" 
          name="coverFile" 
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-2"
        />
        {previewImage && (
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <img 
              src={previewImage} 
              alt="Vista previa" 
              className="w-24 h-24 object-cover rounded-lg border shadow-sm"
            />
          </div>
        )}
        {content?.cover?.url && !previewImage && (
          <div className="mt-2 mb-4">
            <p className="text-sm text-gray-600 mb-2">Carátula actual:</p>
            <img 
              src={content.cover.url} 
              alt="Carátula actual" 
              className="w-24 h-24 object-cover rounded-lg border shadow-sm"
            />
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="audioFile">Archivo de Audio *</Label>
        <Input 
          id="audioFile" 
          name="audioFile" 
          type="file"
          accept="audio/*"
          required={!content}
        />
        {content && (
          <p className="text-sm text-gray-500 mt-1">
            Deja vacío para mantener el archivo actual
          </p>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Upload className="w-4 h-4 mr-2" />
          {content ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
