import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Clock, Mail, Database, Download, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CSVDownload } from 'react-csv'
import { useSettingsStore } from '../store/settingsStore'
import { useStudentStore } from '../store/studentStore'

const Settings = () => {
  const {
    syncTime,
    syncFrequency,
    emailSettings,
    updateSyncTime,
    updateSyncFrequency,
    updateEmailSettings
  } = useSettingsStore()

  const { students } = useStudentStore()
  const [activeTab, setActiveTab] = useState('sync')
  const [downloadCsv, setDownloadCsv] = useState(false)

  const tabs = [
    { id: 'sync', label: 'Sync Settings', icon: Clock },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'data', label: 'Data Management', icon: Database },
  ]

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!')
  }

  const csvData = students.map(student => ({
    handle: student.handle,
    name: student.name,
    rating: student.rating || 0,
    maxRating: student.maxRating || 0,
    rank: student.rank,
    country: student.country,
    lastSynced: student.lastSynced || 'Never'
  }))

  const handleExportData = () => {
    setDownloadCsv(true)
    setTimeout(() => setDownloadCsv(false), 1000)
    toast.success('Data exported successfully!')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col space-y-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-blue-100 bg-clip-text text-transparent">Settings</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Configure your application preferences and data management
          </p>
        </motion.div>
      </div>

      {/* Settings Card */}
      <div className="card mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap px-4 sm:px-6 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mr-6 sm:mr-8 py-3 px-1 border-b-2 font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Sync Settings */}
          {activeTab === 'sync' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Automatic Sync Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sync Time</label>
                    <input
                      type="time"
                      value={syncTime}
                      onChange={(e) => updateSyncTime(e.target.value)}
                      className="input-3d focus:shadow-blue-500/15 dark:focus:shadow-blue-400/10"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Daily sync time for student data updates
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sync Frequency</label>
                    <select
                      value={syncFrequency}
                      onChange={(e) => updateSyncFrequency(e.target.value)}
                      className="input-3d focus:shadow-blue-500/15 dark:focus:shadow-blue-400/10"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      How often to automatically sync data
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Email Notifications</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">Enable Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Send email reminders for inactive students
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailSettings.enabled}
                        onChange={(e) => updateEmailSettings({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Reminder Threshold (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={emailSettings.reminderDays}
                      onChange={(e) => updateEmailSettings({ reminderDays: parseInt(e.target.value) })}
                      className="input-3d max-w-xs focus:shadow-blue-500/15 dark:focus:shadow-blue-400/10"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Send reminder if no activity for this many days
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h4 className="font-medium mb-4 text-gray-800 dark:text-gray-100">SMTP Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">SMTP Host</label>
                        <input
                          type="text"
                          value={emailSettings.smtpSettings.host}
                          onChange={(e) => updateEmailSettings({
                            smtpSettings: { ...emailSettings.smtpSettings, host: e.target.value }
                          })}
                          placeholder="smtp.gmail.com"
                          className="input-3d focus:shadow-blue-500/15 dark:focus:shadow-blue-400/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Port</label>
                        <input
                          type="number"
                          value={emailSettings.smtpSettings.port}
                          onChange={(e) => updateEmailSettings({
                            smtpSettings: { ...emailSettings.smtpSettings, port: parseInt(e.target.value) }
                          })}
                          placeholder="587"
                          className="input-3d"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Username</label>
                        <input
                          type="email"
                          value={emailSettings.smtpSettings.user}
                          onChange={(e) => updateEmailSettings({
                            smtpSettings: { ...emailSettings.smtpSettings, user: e.target.value }
                          })}
                          placeholder="your-email@gmail.com"
                          className="input-3d"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
                        <input
                          type="password"
                          value={emailSettings.smtpSettings.password}
                          onChange={(e) => updateEmailSettings({
                            smtpSettings: { ...emailSettings.smtpSettings, password: e.target.value }
                          })}
                          placeholder="App password"
                          className="input-3d"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Data Management</h3>
                <div className="space-y-6">
                  <div className="card-3d p-5">
                    <h4 className="font-medium mb-2 flex items-center space-x-2 text-gray-800 dark:text-gray-100">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>Export Data</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Download all student data as CSV file
                    </p>
                    <button
                      onClick={handleExportData}
                      className="btn-secondary px-4 py-2 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                    {downloadCsv && (
                      <CSVDownload
                        data={csvData}
                        filename={`students-${new Date().toISOString().split('T')[0]}.csv`}
                      />
                    )}
                  </div>

                  <div className="card-3d p-5">
                    <h4 className="font-medium mb-2 flex items-center space-x-2 text-gray-800 dark:text-gray-100">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span>Storage Information</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{students.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Data Storage:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">Local Browser Storage</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">Never</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800/50">
                    <h4 className="font-medium mb-2 text-red-700 dark:text-red-400">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      This action cannot be undone. All student data will be permanently deleted.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            className="btn-primary px-6 py-3 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Settings
