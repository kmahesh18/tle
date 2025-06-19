import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, TrendingUp, Calendar, Search, Filter, UserPlus, Award, Activity, Star, Eye, Trash2, Download, Table, Grid, Edit, X, Check, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useStudentStore } from '../store/studentStore'
import { codeforcesAPI } from '../utils/codeforcesApi'
import { CSVLink } from 'react-csv'

const Dashboard = () => {
  const { students, addStudent, deleteStudent, loading, setLoading } = useStudentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudentHandle, setNewStudentHandle] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [studentToEdit, setStudentToEdit] = useState(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.handle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'active') return matchesSearch && student.lastSynced
    if (filterStatus === 'inactive') return matchesSearch && !student.lastSynced
    if (filterStatus === 'reminder') return matchesSearch && (student.reminderCount > 0)
    
    return matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return (a.name || a.handle).localeCompare(b.name || b.handle)
      case 'lastSync':
        return new Date(b.lastSynced || 0) - new Date(a.lastSynced || 0)
      case 'reminders':
        return (b.reminderCount || 0) - (a.reminderCount || 0)
      default:
        return 0
    }
  })

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.lastSynced).length,
    avgRating: students.length > 0 ? 
      Math.round(students.reduce((sum, s) => sum + (s.rating || 0), 0) / students.length) : 0,
    recentActivity: students.filter(s => {
      if (!s.lastSynced) return false
      const lastSync = new Date(s.lastSynced)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      return lastSync > threeDaysAgo
    }).length
  }

  const handleAddStudent = async () => {
    if (!newStudentHandle.trim()) {
      toast.error('Please enter a valid handle')
      return
    }

    setLoading(true)
    try {
      const userInfo = await codeforcesAPI.getUserInfo(newStudentHandle.trim())
      const user = userInfo[0]
      
      const studentData = {
        handle: user.handle,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.handle,
        email: email.trim() || '',
        phone: phone.trim() || '',
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unrated',
        avatar: user.avatar || '',
        country: user.country || '',
        city: user.city || '',
        reminderCount: 0,
        emailEnabled: true,
      }

      addStudent(studentData)
      setNewStudentHandle('')
      setEmail('')
      setPhone('')
      setShowAddModal(false)
      toast.success(`Student ${user.handle} added successfully!`)
    } catch (error) {
      toast.error('Failed to fetch user data. Please check the handle.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleEditStudent = (student) => {
    setStudentToEdit({
      ...student,
      email: student.email || '',
      phone: student.phone || ''
    })
  }

  const handleUpdateStudent = async () => {
    if (!studentToEdit) return
    
    setLoading(true)
    try {
      // Only update the handle if it changed
      if (studentToEdit.handle !== students.find(s => s.id === studentToEdit.id)?.handle) {
        const userInfo = await codeforcesAPI.getUserInfo(studentToEdit.handle.trim())
        const user = userInfo[0]
        
        // Update with new Codeforces data
        studentToEdit.rating = user.rating || 0
        studentToEdit.maxRating = user.maxRating || 0
        studentToEdit.rank = user.rank || 'unrated'
        studentToEdit.avatar = user.avatar || ''
        studentToEdit.country = user.country || ''
        studentToEdit.city = user.city || ''
        
        // Reset sync history since handle changed
        studentToEdit.lastSynced = null
      }
      
      // Update the student
      useStudentStore.getState().updateStudent(studentToEdit.id, {
        ...studentToEdit,
        email: studentToEdit.email.trim(),
        phone: studentToEdit.phone.trim(),
      })
      
      setStudentToEdit(null)
      toast.success('Student updated successfully!')
    } catch (error) {
      toast.error('Failed to update student. Please check the handle.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = (id) => {
    deleteStudent(id)
    setDeleteConfirmId(null)
    toast.success('Student deleted successfully!')
  }

  const getRankColor = (rank) => {
    const rankColors = {
      'legendary grandmaster': 'from-red-500 to-red-700',
      'international grandmaster': 'from-red-400 to-red-600',
      'grandmaster': 'from-red-300 to-red-500',
      'international master': 'from-orange-400 to-orange-600',
      'master': 'from-orange-300 to-orange-500',
      'candidate master': 'from-purple-400 to-purple-600',
      'expert': 'from-blue-400 to-blue-600',
      'specialist': 'from-cyan-400 to-cyan-600',
      'pupil': 'from-green-400 to-green-600',
      'newbie': 'from-gray-400 to-gray-600',
      'unrated': 'from-gray-300 to-gray-500'
    }
    return rankColors[rank?.toLowerCase()] || rankColors['unrated']
  }

  const csvData = students.map(s => ({
    Handle: s.handle,
    Name: s.name || '',
    Email: s.email || '',
    Phone: s.phone || '',
    Rating: s.rating || 0,
    'Max Rating': s.maxRating || 0,
    Rank: s.rank || 'Unrated',
    Country: s.country || '',
    City: s.city || '',
    'Last Synced': s.lastSynced ? new Date(s.lastSynced).toLocaleString() : 'Never',
    'Reminder Count': s.reminderCount || 0,
    'Email Enabled': s.emailEnabled ? 'Yes' : 'No'
  }))

  return (
    <div className="page-container px-2 sm:px-6">
      {/* Header */}
      <div className="page-header">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-blue-100 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Manage and track your students' competitive programming progress
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Student</span>
            </motion.button>
            
            {students.length > 0 && (
              <CSVLink 
                data={csvData} 
                filename={`students-${new Date().toISOString().split('T')[0]}.csv`}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export CSV</span>
              </CSVLink>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats Grid - Compact horizontal layout on mobile */}
      <div className="flex flex-row flex-wrap gap-2 sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 mb-4 sm:mb-8 overflow-x-auto pb-2">
        {[
          { 
            label: 'Students', 
            value: stats.totalStudents, 
            icon: Users, 
            color: 'blue'
          },
          { 
            label: 'Active', 
            value: stats.activeStudents, 
            icon: TrendingUp,
            color: 'green'
          },
          { 
            label: 'Avg Rating', 
            value: stats.avgRating, 
            icon: Award,
            color: 'purple'
          },
          { 
            label: 'Recent', 
            value: stats.recentActivity, 
            icon: Calendar,
            color: 'orange'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card p-3 sm:p-6 flex-1 sm:flex-auto min-w-[80px]"
          >
            <div className="flex items-center sm:items-start justify-between sm:mb-4 mb-0">
              <div className={`hidden sm:block p-3 rounded-lg bg-${stat.color}-100/60 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs sm:text-base font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Filters - Stack on mobile */}
      <div className="card p-3 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1 max-w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by handle, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <div className="flex items-center space-x-2 flex-1 sm:flex-none">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input text-xs sm:text-sm flex-1"
              >
                <option value="all">All Students</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="reminder">With Reminders</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-xs sm:text-sm flex-1"
              >
                <option value="rating">By Rating</option>
                <option value="name">By Name</option>
                <option value="lastSync">By Last Sync</option>
                <option value="reminders">By Reminders</option>
              </select>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-r-md ${viewMode === 'table' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
              >
                <Table className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Grid - Adjust for mobile */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="card p-6 hover:translate-y-[-4px] transition-all duration-300 h-full relative">
                {/* Delete button */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <button 
                    onClick={() => handleEditStudent(student)}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  {deleteConfirmId === student.id ? (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleDeleteStudent(student.id)} 
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(null)} 
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirmId(student.id)} 
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Link to={`/student/${student.id}`} className="block">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative flex-shrink-0">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.handle}
                          className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {student.handle[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
                        student.lastSynced ? 'bg-green-500' : 'bg-gray-400'
                      } border-2 border-white dark:border-gray-800`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate text-gray-800 dark:text-gray-100">{student.handle}</h3>
                      <p className="text-gray-600 dark:text-gray-400 truncate">{student.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {student.rating || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Rating</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {student.maxRating || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Max Rating</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.country || 'Unknown'}
                      </span>
                      {student.emailEnabled === false && (
                        <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                          Emails off
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.lastSynced ? 
                          new Date(student.lastSynced).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>
                  </div>
                </Link>
                
                {student.reminderCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Reminder emails sent:
                      </span>
                      <span className="px-2 py-0.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full">
                        {student.reminderCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Students Table - Responsive */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto mb-6 sm:mb-8">
          <table className="table min-w-full text-sm sm:text-base">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Student</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Last Sync</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Reminders</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="relative flex-shrink-0">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.handle}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white dark:border-gray-800"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {student.handle[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                          student.lastSynced ? 'bg-green-500' : 'bg-gray-400'
                        } border border-white dark:border-gray-800`} />
                      </div>
                      <div>
                        <div className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200 truncate max-w-[100px] sm:max-w-none">
                          {student.handle}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">{student.name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                    <div className="text-sm">
                      <div className="truncate max-w-[120px] sm:max-w-[180px]">{student.email || '—'}</div>
                      <div className="text-gray-500">{student.phone || '—'}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <div>
                      <div className="font-medium text-xs sm:text-sm">{student.rating || '—'}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">max: {student.maxRating || '—'}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                    {student.lastSynced ? 
                      new Date(student.lastSynced).toLocaleString() : 
                      'Never synced'
                    }
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                    <div className="flex items-center">
                      {student.reminderCount > 0 ? (
                        <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full">
                          {student.reminderCount}
                        </span>
                      ) : '—'}
                      {student.emailEnabled === false && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                          off
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link 
                        to={`/student/${student.id}`}
                        className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Info className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {deleteConfirmId === student.id ? (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleDeleteStudent(student.id)} 
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(null)} 
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirmId(student.id)} 
                          className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <Users className="w-16 h-16 text-blue-500/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No students found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {students.length === 0 
              ? "Add your first student to get started" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {students.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-6 py-2 mx-auto"
            >
              Add Your First Student
            </button>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add New Student</h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Codeforces Handle *
                  </label>
                  <input
                    type="text"
                    value={newStudentHandle}
                    onChange={(e) => setNewStudentHandle(e.target.value)}
                    placeholder="e.g., tourist, Benq"
                    className="input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddStudent}
                  disabled={loading || !newStudentHandle.trim()}
                  className="btn-primary py-2 flex-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner" />
                      <span>Adding...</span>
                    </div>
                  ) : 'Add Student'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewStudentHandle('')
                    setEmail('')
                    setPhone('')
                  }}
                  className="btn-secondary py-2 flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Edit Student Modal */}
      <AnimatePresence>
        {studentToEdit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Student</h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Codeforces Handle *
                  </label>
                  <input
                    type="text"
                    value={studentToEdit.handle}
                    onChange={(e) => setStudentToEdit({...studentToEdit, handle: e.target.value})}
                    placeholder="e.g., tourist, Benq"
                    className="input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={studentToEdit.email}
                    onChange={(e) => setStudentToEdit({...studentToEdit, email: e.target.value})}
                    placeholder="student@example.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={studentToEdit.phone}
                    onChange={(e) => setStudentToEdit({...studentToEdit, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="input"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="emailEnabled"
                    type="checkbox"
                    checked={studentToEdit.emailEnabled !== false}
                    onChange={(e) => setStudentToEdit({...studentToEdit, emailEnabled: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-700"
                  />
                  <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable reminder emails
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateStudent}
                  disabled={loading || !studentToEdit.handle.trim()}
                  className="btn-primary py-2 flex-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner" />
                      <span>Updating...</span>
                    </div>
                  ) : 'Update Student'}
                </button>
                <button
                  onClick={() => setStudentToEdit(null)}
                  className="btn-secondary py-2 flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
