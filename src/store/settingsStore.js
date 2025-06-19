import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      syncTime: '02:00',
      syncFrequency: 'daily',
      emailSettings: {
        enabled: true,
        reminderDays: 7,
        smtpSettings: {
          host: '',
          port: 587,
          user: '',
          password: '',
        }
      },
      
      updateSyncTime: (time) => set({ syncTime: time }),
      updateSyncFrequency: (frequency) => set({ syncFrequency: frequency }),
      updateEmailSettings: (settings) => set((state) => ({
        emailSettings: { ...state.emailSettings, ...settings }
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
)
