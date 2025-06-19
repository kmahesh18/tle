import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import StudentProfile from './pages/StudentProfile'
import Settings from './pages/Settings'
import { useThemeStore } from './store/themeStore'

function App() {
  const { isDarkMode, initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <Router>
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300 overflow-x-hidden flex flex-col">
        <Navbar />
        
        <motion.main 
          className="flex-grow w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </motion.main>

        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#1f2937',
              border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
