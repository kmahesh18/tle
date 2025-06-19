import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      initializeTheme: () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        set({ isDarkMode: prefersDark })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
