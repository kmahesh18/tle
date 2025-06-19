# TLE Manager

<div align="center">
  <img src="/public/tle-logo.png" alt="TLE Manager Logo" width="200" />
  <h3>A powerful dashboard to track competitive programmers' progress</h3>
</div>

## 📋 Overview

TLE Manager is a comprehensive web application for teachers and coaches to track their students' performance on Codeforces. The name "TLE" is a play on "Time Limit Exceeded," a common verdict in competitive programming, but here it stands for "Track, Learn, Excel" - reflecting the app's purpose of helping instructors monitor student progress.

**[Watch Demo Video](#)** | **[Live Demo](#)** | **[GitHub Repository](#)**

## ✨ Features

- **Student Management**
  - Add students via Codeforces handles
  - View student details including ratings, ranks, and submissions
  - Track student progress over time
  - Categorize and filter students based on activity

- **Performance Analytics**
  - Rating progress charts
  - Problem-solving patterns
  - Tag distribution analysis
  - Monthly progress tracking

- **Problem & Contest Tracking**
  - View solved problems with difficulty breakdown
  - Contest history and performance analysis
  - Filter problems by tags, ratings, and more

- **Automated Synchronization**
  - Schedule automatic data syncs with Codeforces
  - Manual sync option for immediate updates
  - View last sync time for each student

- **Email Notifications**
  - Set up reminders for inactive students
  - Configure SMTP settings for automated emails
  - Toggle notifications on/off for individual students

- **Data Management**
  - Export student data as CSV
  - Persistent storage using browser local storage
  - Dark/Light theme support for comfortable viewing

## 🛠️ Technology Stack

- **Frontend**: React with Vite
- **UI Framework**: TailwindCSS
- **State Management**: Zustand for persistent and centralized state
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **API Integration**: Codeforces API

## 🏗️ Architecture

### Component Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Main application pages
├── store/             # Zustand state stores
├── utils/             # Utility functions and API client
└── assets/            # Static assets and images
```

### State Management

TLE Manager uses Zustand with persistence middleware for state management:

- **StudentStore**: Manages student data, including adding, updating, and deleting students
- **ThemeStore**: Handles theme preferences (dark/light mode)
- **SettingsStore**: Manages application settings like sync frequency and email configurations

### Codeforces API Integration

The application uses the Codeforces API to fetch:
- User information (handle, rating, rank)
- Submission history
- Contest participation
- Problem-solving statistics

## 📊 Dashboard & Analytics

### Student Overview
The dashboard provides a quick glance at all students with key metrics:
- Current and max ratings
- Activity status
- Reminder counts
- Problem-solving statistics

### Student Profile
Each student has a detailed profile page with:

1. **Overview Tab**
   - Rating progress chart
   - Activity statistics
   - Problem distribution by difficulty

2. **Progress Tab**
   - Monthly solved problem trends
   - Problem rating breakdown
   - Tag distribution analysis

3. **Problems Tab**
   - List of solved problems
   - Filtering by difficulty, tags, and date
   - Problem ratings and categories

4. **Contests Tab**
   - Contest participation history
   - Rating changes visualization
   - Performance statistics

## 🔄 Synchronization System

TLE Manager provides two ways to sync data with Codeforces:

1. **Manual Sync**
   - Individual student sync from their profile page
   - Immediate update of all student metrics

2. **Scheduled Sync**
   - Set automatic sync frequency (daily/weekly)
   - Configure preferred sync time
   - Background updates without user intervention

## 📧 Notification System

The application can send email reminders to inactive students:

- Configure SMTP settings for mail server
- Set reminder threshold (days of inactivity)
- View and track sent reminder counts
- Toggle email notifications per student

## 🚀 Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tle-manager.git
   cd tle-manager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

### Using TLE Manager

#### Adding Students
1. Click the "Add Student" button in the dashboard
2. Enter the student's Codeforces handle
3. Optionally add contact information (email, phone)
4. Submit to fetch and save their data

#### Syncing Data
1. Navigate to a student's profile
2. Click the "Sync Data" button to update their information
3. Or configure automatic syncing in Settings

#### Configuring Settings
1. Navigate to the Settings page
2. Set your preferred sync frequency and time
3. Configure email notification settings
4. Manage data export and import options

## 📝 Notes on Data Storage

TLE Manager uses browser local storage to persist data. This means:
- Data remains available between sessions
- No server-side storage is required
- Data is limited to the browser's local storage capacity
- Data is not shared between devices

For team usage, consider exporting data regularly or implementing a backend server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Made with ❤️ for competitive programming coaches and educators</p>
  <p>
    <a href="#">Demo Video</a> | 
    <a href="#">GitHub Repository</a>
  </p>
</div>
