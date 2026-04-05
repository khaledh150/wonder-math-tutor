import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLevelStore = create(
  persist(
    (set, get) => ({
      // State
      allUnlocked: true, // DEV: All levels available
      completedLevels: {}, // { levelId: starCount }
      currentLevelIdx: 0,
      analytics: {
        addition: { mistakes: 0, questions: 0 },
        subtraction: { mistakes: 0, questions: 0 },
        multiplication: { mistakes: 0, questions: 0 },
        division: { mistakes: 0, questions: 0 }
      },

      // Derived
      getTotalStars: () => Object.values(get().completedLevels).reduce((a, b) => a + b, 0),

      // Actions
      setAllUnlocked: (unlocked) => set({ allUnlocked: unlocked }),
      logLevelCompletion: (levelId, operation, mistakes, stars) => {
        set((state) => {
          const oldStars = state.completedLevels[levelId] || 0
          const opMapping = { '+': 'addition', '-': 'subtraction', '×': 'multiplication', '÷': 'division' }
          const key = opMapping[operation] || 'addition'
          const stats = state.analytics?.[key] || { mistakes: 0, questions: 0 }
          
          return {
            completedLevels: { ...state.completedLevels, [levelId]: Math.max(oldStars, stars) },
            analytics: {
              ...state.analytics,
              [key]: { mistakes: stats.mistakes + (mistakes || 0), questions: stats.questions + 1 }
            }
          }
        })
      },

      addCompletedLevel: (levelId, starCount = 3) => {
        set((state) => ({ completedLevels: { ...state.completedLevels, [levelId]: starCount } }))
      },

      setCurrentLevel: (idx) => set({ currentLevelIdx: idx }),

      resetProgress: () => set({ 
        completedLevels: {}, 
        currentLevelIdx: 0,
        analytics: {
          addition: { mistakes: 0, questions: 0 },
          subtraction: { mistakes: 0, questions: 0 },
          multiplication: { mistakes: 0, questions: 0 },
          division: { mistakes: 0, questions: 0 }
        }
      })
    }),
    {
      name: 'wonder-math-progression',
    }
  )
)

export default useLevelStore
