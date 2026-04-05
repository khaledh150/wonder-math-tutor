import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAudioStore = create(
  persist(
    (set) => ({
      // State
      bgmEnabled: true,
      sfxEnabled: true,
      voiceEnabled: true,

      // Actions
      toggleBgm: () => set((state) => ({ bgmEnabled: !state.bgmEnabled })),
      toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),
      toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled }))
    }),
    {
      name: 'wonder-math-audio',
    }
  )
)

export default useAudioStore
