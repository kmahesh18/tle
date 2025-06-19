import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Calendar, Trophy, Target, TrendingUp, Code, Award, Clock, Zap, 
  Filter, Search, ChevronUp, ChevronDown, CheckCircle, XCircle, AlertCircle, ExternalLink, 
  BarChart2, LineChart as LineChartIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { useStudentStore } from '../store/studentStore'
import { codeforcesAPI } from '../utils/codeforcesApi'

const StudentProfile = () => {
  const { id } = useParams()
  const { getStudentById, updateStudent } = useStudentStore()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Problem tab states
  const [problemSearch, setProblemSearch] = useState('')
  const [problemSort, setProblemSort] = useState('date')
  const [problemSortDir, setProblemSortDir] = useState('desc')
  const [problemTagFilter, setProblemTagFilter] = useState('')
  
  // Contest tab states
  const [contestSearch, setContestSearch] = useState('')
  const [contestSort, setContestSort] = useState('date')
  const [contestSortDir, setContestSortDir] = useState('desc')

  useEffect(() => {
    const foundStudent = getStudentById(id)
    setStudent(foundStudent)
    if (foundStudent && foundStudent.solvedProblems) {
      setUserData(foundStudent)
    }
  }, [id, getStudentById])

  const syncStudentData = async () => {
    if (!student) return

    setLoading(true)
    try {
      const [userInfo, submissions, ratingHistory] = await Promise.all([
        codeforcesAPI.getUserInfo(student.handle),
        codeforcesAPI.getUserSubmissions(student.handle),
        codeforcesAPI.getUserRating(student.handle).catch(() => [])
      ])

      const processedData = codeforcesAPI.processUserData(userInfo, submissions, ratingHistory)
      setUserData(processedData)

      // Update student in store
      updateStudent(student.id, {
        ...processedData,
        lastSynced: new Date().toISOString()
      })

      toast.success('Student data synced successfully!')
    } catch (error) {
      toast.error('Failed to sync student data')
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank) => {
    const rankColors = {
      'legendary grandmaster': 'text-red-600',
      'international grandmaster': 'text-red-600',
      'grandmaster': 'text-red-500',
      'international master': 'text-orange-500',
      'master': 'text-orange-500',
      'candidate master': 'text-purple-500',
      'expert': 'text-blue-500',
      'specialist': 'text-cyan-500',
      'pupil': 'text-green-500',
      'newbie': 'text-gray-500',
      'unrated': 'text-gray-500'
    }
    return rankColors[rank?.toLowerCase()] || rankColors['unrated']
  }
  
  // Extract all unique tags from problems
  const getAllTags = () => {
    if (!userData?.solvedProblems) return [];
    const tagsSet = new Set();
    userData.solvedProblems.forEach(problem => {
      if (problem.tags) {
        problem.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }
  
  // Filter and sort problems based on user selection
  const getFilteredProblems = () => {
    if (!userData?.solvedProblems) return [];
    
    return userData.solvedProblems
      .filter(problem => {
        // Search filter
        const matchesSearch = 
          (problem.name?.toLowerCase() || '').includes(problemSearch.toLowerCase()) ||
          (problem.index?.toLowerCase() || '').includes(problemSearch.toLowerCase()) ||
          (problem.contestId?.toString() || '').includes(problemSearch);
          
        // Tag filter
        const matchesTag = !problemTagFilter || 
          (problem.tags && problem.tags.some(tag => tag.toLowerCase() === problemTagFilter.toLowerCase()));
          
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        // Sort by selected criteria
        switch(problemSort) {
          case 'date':
            comparison = new Date(a.solvedAt || 0) - new Date(b.solvedAt || 0);
            break;
          case 'rating':
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
          case 'name':
            comparison = (a.name || '').localeCompare(b.name || '');
            break;
          case 'contest':
            comparison = (a.contestId || 0) - (b.contestId || 0);
            break;
          default:
            comparison = 0;
        }
        
        // Apply sort direction
        return problemSortDir === 'desc' ? -comparison : comparison;
      });
  }
  
  // Filter and sort contests based on user selection
  const getFilteredContests = () => {
    if (!userData?.ratingHistory) return [];
    
    return userData.ratingHistory
      .filter(contest => {
        return (contest.contestName?.toLowerCase() || '').includes(contestSearch.toLowerCase()) ||
               (contest.rank?.toString() || '').includes(contestSearch);
      })
      .sort((a, b) => {
        let comparison = 0;
        
        // Sort by selected criteria
        switch(contestSort) {
          case 'date':
            comparison = new Date(a.ratingUpdateTimeSeconds * 1000) - new Date(b.ratingUpdateTimeSeconds * 1000);
            break;
          case 'rating':
            comparison = a.newRating - b.newRating;
            break;
          case 'change':
            comparison = (a.newRating - a.oldRating) - (b.newRating - b.oldRating);
            break;
          case 'rank':
            comparison = a.rank - b.rank;
            break;
          default:
            comparison = 0;
        }
        
        // Apply sort direction
        return contestSortDir === 'desc' ? -comparison : comparison;
      });
  }
  
  // Generate monthly solved problems data for trends
  const getMonthlySolvedData = () => {
    if (!userData?.solvedProblems) return [];
    
    const monthlyData = {};
    userData.solvedProblems.forEach(problem => {
      if (problem.solvedAt) {
        const date = new Date(problem.solvedAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
            count: 0,
            ratings: { '800-1199': 0, '1200-1599': 0, '1600-1999': 0, '2000-2399': 0, '2400+': 0, 'unrated': 0 }
          };
        }
        
        monthlyData[monthYear].count++;
        
        // Add to ratings breakdown
        if (!problem.rating) {
          monthlyData[monthYear].ratings.unrated++;
        } else if (problem.rating < 1200) {
          monthlyData[monthYear].ratings['800-1199']++;
        } else if (problem.rating < 1600) {
          monthlyData[monthYear].ratings['1200-1599']++;
        } else if (problem.rating < 2000) {
          monthlyData[monthYear].ratings['1600-1999']++;
        } else if (problem.rating < 2400) {
          monthlyData[monthYear].ratings['2000-2399']++;
        } else {
          monthlyData[monthYear].ratings['2400+']++;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  // Calculate tag distribution for pie chart
  const getTagDistribution = () => {
    if (!userData?.solvedProblems) return [];
    
    const tagCounts = {};
    userData.solvedProblems.forEach(problem => {
      if (problem.tags) {
        problem.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count
    const tagData = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
    // Limit to top 10 tags, combine the rest as "Other"
    if (tagData.length > 10) {
      const topTags = tagData.slice(0, 10);
      const otherTags = tagData.slice(10);
      const otherSum = otherTags.reduce((sum, item) => sum + item.count, 0);
      topTags.push({ tag: 'Other', count: otherSum });
      return topTags;
    }
    
    return tagData;
  }
  
  // COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  const RATING_COLORS = {
    'unrated': '#a0aec0',
    '800-1199': '#68d391',
    '1200-1599': '#4299e1',
    '1600-1999': '#9f7aea',
    '2000-2399': '#ed8936',
    '2400+': '#f56565'
  };

  if (!student) {
    return (
      <div className="page-container">
        <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            Student not found
          </h2>
          <Link to="/" className="btn-primary mt-6 inline-flex items-center space-x-2 px-6 py-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Award },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'problems', label: 'Problems', icon: Code },
    { id: 'contests', label: 'Contests', icon: Calendar },
  ]

  return (
    <div className="page-container px-2 sm:px-6">
      {/* Page Header - Made more mobile-friendly */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.handle}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md border-2 border-white dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {student.handle[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-blue-100 bg-clip-text text-transparent break-all">{student.handle}</h1>
                <div className="flex items-center flex-wrap">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mr-2">{student.name}</p>
                  {student.rank && (
                    <span className={`px-2 py-0.5 text-xs sm:text-sm rounded-full ${getRankColor(student.rank)}`}>
                      {student.rank.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={syncStudentData}
            disabled={loading}
            className="btn-primary px-4 sm:px-6 py-2 flex items-center space-x-2 self-start sm:self-center text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats - Compact row on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[
          { label: 'Current Rating', value: userData?.rating || student.rating || 'Unrated', icon: Trophy, color: 'blue' },
          { label: 'Max Rating', value: userData?.maxRating || student.maxRating || 'N/A', icon: Target, color: 'indigo' },
          { label: 'Problems Solved', value: userData?.solvedCount || 'N/A', icon: Code, color: 'purple' },
          { label: 'Contests', value: userData?.ratingHistory?.length || 'N/A', icon: Calendar, color: 'orange' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card p-3 sm:p-6"
          >
            <div className="flex items-center sm:items-start justify-between sm:mb-4 mb-0">
              <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-100/60 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs sm:text-base font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="card mb-6 sm:mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-none">
          <nav className="flex flex-nowrap px-2 sm:px-6 pt-2 sm:pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mr-4 sm:mr-8 py-2 sm:py-3 px-1 whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {userData?.ratingHistory && userData.ratingHistory.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100">Rating Progress</h3>
                  <div className="h-48 sm:h-64 bg-white dark:bg-gray-900/60 rounded-lg p-2 sm:p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userData.ratingHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                        <XAxis 
                          dataKey="contestName" 
                          tick={false}
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          stroke="#9ca3af"
                        />
                        <Tooltip 
                          labelFormatter={(value) => `Contest: ${value}`}
                          formatter={(value) => [value, 'Rating']}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="newRating" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No rating data available. Sync to load data.</p>
                </div>
              )}

              {userData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white dark:bg-gray-900/60 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Activity Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium text-gray-800 dark:text-gray-200">{userData.currentStreak} days</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{userData.longestStreak} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{userData.averageRating}</span>
                      </div>
                      {student.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Contact</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{student.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900/60 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Problem Distribution</h3>
                    {userData.solvedProblems && userData.solvedProblems.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={codeforcesAPI.getRatingDistribution(userData.solvedProblems)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                            <XAxis dataKey="range" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No problem data available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div className="space-y-6 sm:space-y-8">
              {userData?.solvedProblems && userData.solvedProblems.length > 0 ? (
                <>
                  {/* Monthly Problems Solved */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                      <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                      Monthly Problems Solved
                    </h3>
                    <div className="h-48 sm:h-72 bg-white dark:bg-gray-900/60 rounded-lg p-2 sm:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getMonthlySolvedData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            formatter={(value, name) => [value, 'Problems']}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '0.5rem',
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            fill="#93c5fd" 
                            stroke="#3b82f6" 
                            fillOpacity={0.6} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Problem Ratings Over Time */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                      <LineChartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                      Problem Ratings Breakdown by Month
                    </h3>
                    <div className="h-48 sm:h-72 bg-white dark:bg-gray-900/60 rounded-lg p-2 sm:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMonthlySolvedData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            formatter={(value, name) => [value, name]}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '0.5rem',
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="ratings.800-1199" stackId="a" name="800-1199" fill="#68d391" />
                          <Bar dataKey="ratings.1200-1599" stackId="a" name="1200-1599" fill="#4299e1" />
                          <Bar dataKey="ratings.1600-1999" stackId="a" name="1600-1999" fill="#9f7aea" />
                          <Bar dataKey="ratings.2000-2399" stackId="a" name="2000-2399" fill="#ed8936" />
                          <Bar dataKey="ratings.2400+" stackId="a" name="2400+" fill="#f56565" />
                          <Bar dataKey="ratings.unrated" stackId="a" name="Unrated" fill="#a0aec0" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Tag Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Problem Tags Distribution</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-64 bg-white dark:bg-gray-900/60 rounded-lg p-4 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getTagDistribution()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="tag"
                              label={({ tag, percent }) => `${tag} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getTagDistribution().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name, props) => [`${value} problems`, props.payload.tag]}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4">
                        <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Top Tags</h4>
                        <div className="space-y-2">
                          {getTagDistribution().map((item, index) => (
                            <div key={item.tag} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{backgroundColor: COLORS[index % COLORS.length]}} 
                                />
                                <span className="text-gray-700 dark:text-gray-300">{item.tag}</span>
                              </div>
                              <span className="text-gray-600 dark:text-gray-400">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No progress data available</p>
                  <p className="text-gray-400 mt-2">Sync data to see problem-solving progress</p>
                </div>
              )}
            </div>
          )}

          {/* PROBLEMS TAB - Make filters stack on mobile */}
          {activeTab === 'problems' && (
            <div className="space-y-4 sm:space-y-6">
              {userData?.solvedProblems && userData.solvedProblems.length > 0 ? (
                <>
                  {/* Filters - Stacked on mobile */}
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search problems..."
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                      <select
                        value={problemTagFilter}
                        onChange={(e) => setProblemTagFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 px-3 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      >
                        <option value="">All Tags</option>
                        {getAllTags().map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                      
                      <div className="flex gap-2">
                        <select
                          value={problemSort}
                          onChange={(e) => setProblemSort(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 px-3 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                        >
                          <option value="date">Sort by Date</option>
                          <option value="rating">Sort by Rating</option>
                          <option value="name">Sort by Name</option>
                          <option value="contest">Sort by Contest</option>
                        </select>
                        
                        <button
                          onClick={() => setProblemSortDir(problemSortDir === 'asc' ? 'desc' : 'asc')}
                          className="flex items-center justify-center w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={problemSortDir === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                        >
                          {problemSortDir === 'asc' ? 
                            <ChevronUp className="w-5 h-5" /> : 
                            <ChevronDown className="w-5 h-5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Problems Table - Responsive scrolling for mobile */}
                  <div className="overflow-x-auto">
                    <table className="table min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Problem</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contest</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Solved On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {getFilteredProblems().map((problem) => (
                          <tr key={`${problem.contestId}-${problem.index}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                            <td className="px-4 py-3">
                              <a 
                                href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <span className="font-medium">{problem.index}. {problem.name}</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <a 
                                href={`https://codeforces.com/contest/${problem.contestId}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {problem.contestId}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              {problem.rating ? 
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                  {problem.rating}
                                </span> : 
                                <span className="text-gray-500">Unrated</span>
                              }
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {problem.tags?.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag} 
                                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {problem.tags?.length > 3 && (
                                  <span className="px-1 py-0.5 text-xs text-gray-500">
                                    +{problem.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                              {problem.solvedAt ? new Date(problem.solvedAt).toLocaleDateString() : 'Unknown'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* No results */}
                  {getFilteredProblems().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                      <p className="text-gray-500">No problems match your search criteria</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                  <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No solved problems found</p>
                  <p className="text-gray-400 mt-2">Sync data to see solved problems</p>
                </div>
              )}
            </div>
          )}

          {/* CONTESTS TAB - Similar mobile optimizations */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              {userData?.ratingHistory && userData.ratingHistory.length > 0 ? (
                <>
                  {/* Contest Stats Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 mb-1">Total Contests</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.ratingHistory.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 mb-1">Best Rank</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {userData.ratingHistory.reduce((min, contest) => 
                          Math.min(min, contest.rank || Infinity), Infinity) === Infinity ? 
                          'N/A' : 
                          userData.ratingHistory.reduce((min, contest) => 
                            Math.min(min, contest.rank || Infinity), Infinity)
                        }
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/60 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 mb-1">Best Rating Change</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {userData.ratingHistory.reduce((max, contest) => 
                          Math.max(max, (contest.newRating - contest.oldRating) || -Infinity), -Infinity) === -Infinity ? 
                          'N/A' : 
                          '+' + userData.ratingHistory.reduce((max, contest) => 
                            Math.max(max, (contest.newRating - contest.oldRating) || -Infinity), -Infinity)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:items-center sm:space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search contests..."
                        value={contestSearch}
                        onChange={(e) => setContestSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={contestSort}
                        onChange={(e) => setContestSort(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 px-3 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="change">Sort by Change</option>
                        <option value="rank">Sort by Rank</option>
                      </select>
                      
                      <button
                        onClick={() => setContestSortDir(contestSortDir === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center justify-center w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={contestSortDir === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                      >
                        {contestSortDir === 'asc' ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  {/* Contests Table */}
                  <div className="overflow-x-auto">
                    <table className="table min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contest</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Old Rating</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">New Rating</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Change</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {getFilteredContests().map((contest) => (
                          <tr key={contest.contestId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                            <td className="px-4 py-3">
                              <a 
                                href={`https://codeforces.com/contest/${contest.contestId}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <span className="font-medium">{contest.contestName}</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {contest.rank}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {contest.oldRating}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {contest.newRating}
                            </td>
                            <td className="px-4 py-3">
                              <span className={
                                contest.newRating > contest.oldRating
                                  ? "text-green-600 dark:text-green-400 font-medium"
                                  : contest.newRating < contest.oldRating
                                  ? "text-red-600 dark:text-red-400 font-medium"
                                  : "text-gray-600 dark:text-gray-400"
                              }>
                                {contest.newRating > contest.oldRating ? '+' : ''}
                                {contest.newRating - contest.oldRating}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                              {new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* No results */}
                  {getFilteredContests().length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                      <p className="text-gray-500">No contests match your search criteria</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/60 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No contests found</p>
                  <p className="text-gray-400 mt-2">Sync data to see contest history</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact Info & Additional Data */}
      {student.email || student.phone || student.country ? (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {student.email && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-800 dark:text-gray-100">{student.email}</p>
              </div>
            )}
            {student.phone && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-800 dark:text-gray-100">{student.phone}</p>
              </div>
            )}
            {student.country && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-800 dark:text-gray-100">{student.country} {student.city ? `- ${student.city}` : ''}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudentProfile
