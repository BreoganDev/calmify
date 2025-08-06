
'use client'

import { createContext, useContext, useReducer, useRef, useEffect } from 'react'
import { Audio, Cover, Category } from '@prisma/client'

type AudioWithDetails = Audio & {
  cover?: Cover | null
  category: Category
}

interface AudioState {
  currentAudio: AudioWithDetails | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  queue: AudioWithDetails[]
  currentIndex: number
  isRepeat: boolean
  isShuffle: boolean
  playbackRate: number
}

type AudioAction =
  | { type: 'SET_CURRENT_AUDIO'; payload: AudioWithDetails }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_QUEUE'; payload: AudioWithDetails[] }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }

const initialState: AudioState = {
  currentAudio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  queue: [],
  currentIndex: 0,
  isRepeat: false,
  isShuffle: false,
  playbackRate: 1,
}

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'SET_CURRENT_AUDIO':
      return {
        ...state,
        currentAudio: action.payload,
        currentTime: 0,
        isLoading: true,
      }
    case 'PLAY':
      return { ...state, isPlaying: true }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload }
    case 'SET_DURATION':
      return { ...state, duration: action.payload }
    case 'SET_VOLUME':
      return { ...state, volume: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_QUEUE':
      return { ...state, queue: action.payload }
    case 'NEXT_TRACK':
      const nextIndex = state.isShuffle 
        ? Math.floor(Math.random() * state.queue.length)
        : (state.currentIndex + 1) % state.queue.length
      return {
        ...state,
        currentIndex: nextIndex,
        currentAudio: state.queue[nextIndex] || null,
        currentTime: 0,
      }
    case 'PREVIOUS_TRACK':
      const prevIndex = state.currentIndex === 0 
        ? state.queue.length - 1 
        : state.currentIndex - 1
      return {
        ...state,
        currentIndex: prevIndex,
        currentAudio: state.queue[prevIndex] || null,
        currentTime: 0,
      }
    case 'TOGGLE_REPEAT':
      return { ...state, isRepeat: !state.isRepeat }
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffle: !state.isShuffle }
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload }
    default:
      return state
  }
}

const AudioContext = createContext<{
  state: AudioState
  dispatch: React.Dispatch<AudioAction>
  audioRef: React.RefObject<HTMLAudioElement>
} | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime })
    }

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration })
    }

    const handleLoadedData = () => {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    const handleEnded = () => {
      if (state.isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        dispatch({ type: 'NEXT_TRACK' })
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [state.isRepeat])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = state.volume
    audio.playbackRate = state.playbackRate

    if (state.currentAudio) {
      audio.src = state.currentAudio.fileUrl
      if (state.isPlaying) {
        audio.play().catch(console.error)
      }
    }
  }, [state.currentAudio, state.isPlaying, state.volume, state.playbackRate])

  return (
    <AudioContext.Provider value={{ state, dispatch, audioRef }}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
