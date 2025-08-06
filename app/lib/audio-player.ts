
import { create } from 'zustand';
import { Audio, AudioPlayerState } from './types';

interface AudioPlayerStore extends AudioPlayerState {
  setCurrentAudio: (audio: Audio | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaylist: (playlist: Audio[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  reset: () => void;
}

const initialState: AudioPlayerState = {
  currentAudio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  playlist: [],
  currentIndex: -1,
};

export const useAudioPlayer = create<AudioPlayerStore>((set, get) => ({
  ...initialState,
  
  setCurrentAudio: (audio) => {
    const state = get();
    const index = audio ? state.playlist.findIndex(a => a.id === audio.id) : -1;
    set({ currentAudio: audio, currentIndex: index });
  },
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setPlaylist: (playlist) => set({ playlist }),
  
  playNext: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.playlist.length) {
      const nextAudio = state.playlist[nextIndex];
      set({ currentAudio: nextAudio, currentIndex: nextIndex });
    }
  },
  
  playPrevious: () => {
    const state = get();
    const prevIndex = state.currentIndex - 1;
    if (prevIndex >= 0) {
      const prevAudio = state.playlist[prevIndex];
      set({ currentAudio: prevAudio, currentIndex: prevIndex });
    }
  },
  
  reset: () => set(initialState),
}));
