import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en', // 'en' | 'th'
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'wonder-math-language', // LocalStorage key
    }
  )
)

export default useLanguageStore
