import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStudentStore = create(
  persist(
    (set, get) => ({
      students: [],
      selectedStudent: null,
      loading: false,
      lastSyncTime: null,
      
      addStudent: (student) => {
        const newStudent = {
          ...student,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          lastSynced: null,
          reminderCount: 0,
          emailEnabled: true,
        }
        set((state) => ({
          students: [...state.students, newStudent]
        }))
        return newStudent.id
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map(student =>
            student.id === id ? { ...student, ...updates } : student
          )
        }))
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter(student => student.id !== id)
        }))
      },

      setSelectedStudent: (student) => {
        set({ selectedStudent: student })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      updateLastSync: () => {
        set({ lastSyncTime: new Date().toISOString() })
      },

      getStudentById: (id) => {
        return get().students.find(student => student.id === id)
      },
    }),
    {
      name: 'student-storage',
    }
  )
)
