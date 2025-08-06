
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
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AudioContent, Category } from '@/lib/types';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [audioContent, setAudioContent] = useState<AudioContent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<AudioContent | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/content'),
        fetch('/api/admin/categories')
      ]);
      
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setAudioContent(contentData);
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
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

  const handleDeleteContent = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;
    
    try {
      const response = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Contenido eliminado correctamente"
        });
        fetchData();
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
    
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Categoría eliminada correctamente"
        });
        fetchData();
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
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestiona el contenido y categorías de Calmify</p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Contenido de Audio</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Contenido de Audio</h2>
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingContent(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingContent ? 'Editar Contenido' : 'Agregar Nuevo Contenido'}
                  </DialogTitle>
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
              <Card key={content.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      {content.cover?.url && (
                        <img 
                          src={content.cover.url} 
                          alt={`Carátula de ${content.title}`}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{content.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{content.category.name}</Badge>
                          {content.author && (
                            <span className="text-sm text-gray-500">por {content.author}</span>
                          )}
                          <span className="text-sm text-gray-500">
                            {content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : 'Duración desconocida'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingContent(content);
                          setIsContentDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Categorías</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCategory(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                  </DialogTitle>
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
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{category.description}</p>
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
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
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
