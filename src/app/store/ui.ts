
import { create } from 'zustand'

type Quality = 'low' | 'medium' | 'high'

interface UIState {
  quality: Quality
  bloom: boolean
  ssao: boolean

  outline: boolean
  mouseSensitivity: number
  set: (p: Partial<UIState>) => void
}

export const useUI = create<UIState>((set) => ({
  quality: 'medium',
  bloom: true,
  ssao: true,
  outline: true,
  mouseSensitivity: 0.0022,
  set: (p) => set(p),
}))
