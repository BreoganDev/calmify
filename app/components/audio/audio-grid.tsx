
'use client';

import { Audio } from '@/lib/types';
import { AudioCard } from './audio-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Music, Search } from 'lucide-react';

interface AudioGridProps {
  audios: Audio[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AudioGrid({ 
  audios, 
  isLoading = false,
  emptyMessage = "No se encontró contenido de audio."
}: AudioGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (audios.length === 0) {
    return (
      <EmptyState
        icon={Music}
        title="Sin contenido"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {audios.map((audio) => (
        <AudioCard
          key={audio.id}
          audio={audio}
          showPlayButton={true}
          compact={false}
        />
      ))}
    </div>
  );
}
