
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Mic, Brain, Sparkles, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioGrid } from '@/components/audio/audio-grid';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAudioPlayer } from '@/lib/audio-player';
import { Audio, CategoryType } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '@/lib/constants';

interface CategoryContentProps {
  categoryType: CategoryType;
}

export function CategoryContent({ categoryType }: CategoryContentProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { setPlaylist } = useAudioPlayer();
  
  const [audios, setAudios] = useState<Audio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [sortBy, setSortBy] = useState('recent');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchAudios();
  }, [categoryType, sortBy]);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  useEffect(() => {
    if (searchParams?.get('q')) {
      setSearchQuery(searchParams.get('q') || '');
      fetchAudios(searchParams.get('q') || '');
    }
  }, [searchParams]);

  const fetchAudios = async (search?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        category: categoryType,
        limit: '50',
      });

      if (search || searchQuery) {
        params.append('search', search || searchQuery);
      }

      const response = await fetch(`/api/audio?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Sort data based on sortBy
        let sortedData = [...data];
        switch (sortBy) {
          case 'popular':
            sortedData.sort((a, b) => b.listens - a.listens);
            break;
          case 'duration':
            sortedData.sort((a, b) => (a.duration || 0) - (b.duration || 0));
            break;
          case 'recent':
          default:
            // Already sorted by recent in API
            break;
        }
        
        setAudios(sortedData);
        setPlaylist(sortedData);
      }
    } catch (error) {
      console.error('Error fetching audios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        setFavoritedIds(favorites.map((f: any) => f.audioId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAudios();
  };

  const handlePlay = async (audio: Audio) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    // Track listen
    try {
      await fetch('/api/listens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId: audio.id }),
      });
    } catch (error) {
      console.error('Error tracking listen:', error);
    }
  };

  const handleFavorite = async (audioId: string) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    try {
      const isFavorited = favoritedIds.includes(audioId);
      const method = isFavorited ? 'DELETE' : 'POST';
      
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioId }),
      });

      if (response.ok) {
        if (isFavorited) {
          setFavoritedIds(prev => prev.filter(id => id !== audioId));
        } else {
          setFavoritedIds(prev => [...prev, audioId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getCategoryIcon = () => {
    switch (categoryType) {
      case 'PODCAST': return Mic;
      case 'MEDITATION': return Brain;
      case 'HYPNOSIS': return Sparkles;
    }
  };

  const Icon = getCategoryIcon();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 mb-8"
        style={{
          background: `linear-gradient(135deg, ${CATEGORY_COLORS[categoryType]}10, ${CATEGORY_COLORS[categoryType]}20)`,
        }}
      >
        <div 
          className="inline-flex p-4 rounded-full mb-4"
          style={{ backgroundColor: `${CATEGORY_COLORS[categoryType]}20` }}
        >
          <Icon 
            className="h-12 w-12"
            style={{ color: CATEGORY_COLORS[categoryType] }}
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {CATEGORY_NAMES[categoryType]}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {categoryType === 'PODCAST' && 'Descubre contenido inspirador y educativo que transformará tu perspectiva y te ayudará a crecer personal y profesionalmente.'}
          {categoryType === 'MEDITATION' && 'Encuentra paz interior y equilibrio mental con nuestras meditaciones guiadas diseñadas para todos los niveles.'}
          {categoryType === 'HYPNOSIS' && 'Transforma patrones mentales limitantes y alcanza tus objetivos con sesiones de autohipnosis profesionales.'}
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="search"
            placeholder="Buscar contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </form>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más reciente</SelectItem>
              <SelectItem value="popular">Más popular</SelectItem>
              <SelectItem value="duration">Duración</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Audio Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AudioGrid
          audios={audios}
          isLoading={isLoading}
          emptyMessage={`No se encontraron ${CATEGORY_NAMES[categoryType].toLowerCase()}.`}
        />
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Iniciar Sesión Requerido"
        description="Para reproducir contenido necesitas tener una cuenta en Calmify."
      />
    </div>
  );
}
