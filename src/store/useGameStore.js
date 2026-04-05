// useGameStore.js — Unified State Machine for Arcade/Pedagogical Pivot.
import { create } from 'zustand'

// Standard Stages used by both flows
const MISSION_STAGES = ['adventure', 'builder', 'tutor', 'celebration']

const useGameStore = create((set, get) => ({
  // Core State
  currentQuestion: null,
  stage: 'adventure', 
  stageIndex: 0,
  
  // Progress & Interaction
  isPaused: false,
  microStep: 0,
  mistakesMade: 0,
  isComplete: false,

  // Pivot Mode Detection (Mission 1 Trial)
  isAnalyzerMode: () => {
    const q = get().currentQuestion
    return q?.id === 1 || q?.id === '1'
  },

  // Actions
  setQuestion: (question) => {
    set({ 
      currentQuestion: question, 
      stage: 'adventure', 
      stageIndex: 0,
      microStep: 0,
      mistakesMade: 0,
      isComplete: false
    })
  },

  nextStage: () => {
    const { stageIndex } = get()
    if (stageIndex < MISSION_STAGES.length - 1) {
      const nextIdx = stageIndex + 1
      set({ 
        stageIndex: nextIdx,
        stage: MISSION_STAGES[nextIdx],
        microStep: 0
      })
    } else {
      set({ isComplete: true })
    }
  },

  setMicroStep: (step) => set({ microStep: step }),
  setPaused: (paused) => set({ isPaused: paused }),
  addMistake: () => set((state) => ({ mistakesMade: state.mistakesMade + 1 })),
  resetStage: () => set({ microStep: 0 })
}))

export default useGameStore
