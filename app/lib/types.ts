
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean; // Helper property
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: 'PODCAST' | 'MEDITATION' | 'HYPNOSIS';
  color: string | null;
  icon: string | null;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  audios: Audio[];
}

export interface Audio {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  fileUrl: string;
  fileSize: number | null;
  coverId: string | null;
  categoryId: string;
  author: string | null;
  isPublished: boolean;
  listens: number;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  cover?: Cover | null;
  _count?: {
    favorites: number;
    listenHistory: number;
  };
}

// Alias para compatibilidad con el admin
export interface AudioContent extends Audio {
  audioUrl: string;
  imageUrl?: string | null;
}

export interface Cover {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  audioId: string;
  createdAt: Date;
  audio: Audio;
}

export interface Listen {
  id: string;
  userId: string;
  audioId: string;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  audio: Audio;
}

export interface AudioPlayerState {
  currentAudio: Audio | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  playlist: Audio[];
  currentIndex: number;
}

export type CategoryType = 'PODCAST' | 'MEDITATION' | 'HYPNOSIS';

export interface SearchFilters {
  category?: CategoryType;
  author?: string;
  duration?: {
    min?: number;
    max?: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: PlaylistItem[];
  user?: User;
  _count?: {
    items: number;
  };
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  audioId: string;
  order: number;
  createdAt: Date;
  playlist?: Playlist;
  audio?: Audio;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  audioId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  audio?: Audio;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}
