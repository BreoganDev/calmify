
export const CATEGORY_COLORS = {
  PODCAST: '#8B5CF6', // Purple
  MEDITATION: '#10B981', // Green
  HYPNOSIS: '#3B82F6', // Blue
} as const;

export const CATEGORY_ICONS = {
  PODCAST: 'Mic',
  MEDITATION: 'Brain',
  HYPNOSIS: 'Sparkles',
} as const;

export const CATEGORY_NAMES = {
  PODCAST: 'Podcasts',
  MEDITATION: 'Meditaciones',
  HYPNOSIS: 'Autohipnosis',
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ROUTES = {
  HOME: '/',
  PODCASTS: '/podcasts',
  MEDITATIONS: '/meditations',
  HYPNOSIS: '/hypnosis',
  ADMIN: '/admin',
  PROFILE: '/profile',
  AUTH: '/auth',
} as const;

export const API_ROUTES = {
  AUDIO: '/api/audio',
  CATEGORIES: '/api/categories',
  COVERS: '/api/covers',
  USERS: '/api/users',
  FAVORITES: '/api/favorites',
  LISTENS: '/api/listens',
  UPLOAD: '/api/upload',
  SEARCH: '/api/search',
} as const;
