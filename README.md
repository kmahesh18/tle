# TLE Manager

<div align="center">
  <h3>A powerful dashboard to track competitive programmers' progress</h3>
  
  ![TLE Manager](https://img.shields.io/badge/TLE-Manager-blue)
  ![React](https://img.shields.io/badge/React-19.0.0-61dafb)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8)
  ![Vite](https://img.shields.io/badge/Vite-6.3.5-646cff)
</div>

## 📋 Overview

TLE Manager is a comprehensive web application for teachers and coaches to track their students' performance on Codeforces. The name "TLE" is a play on "Time Limit Exceeded," a common verdict in competitive programming, but here it stands for "Track, Learn, Excel" - reflecting the app's purpose of helping instructors monitor student progress.

**[Watch Demo Video](https://drive.google.com/file/d/1iyaoB3Milu_VVr-Q8hFDjiDpBZoPoAz4/view?usp=sharing)** | **[Live Demo](https://tle-kohl.vercel.app/)** | **[GitHub Repository](https://github.com/kmahesh18/tle)**

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

- **Frontend**: React v19 with Vite for fast development and optimized builds
- **UI Framework**: TailwindCSS with custom extended classes for unique design elements
- **State Management**: Zustand with persistence middleware for efficient and reliable state handling
- **Charts**: Recharts for responsive and customizable data visualization
- **Animation**: Framer Motion for fluid, physics-based animations and transitions
- **Icons**: Lucide React for consistent, lightweight SVG icons
- **Notifications**: React Hot Toast for unobtrusive user notifications
- **API Integration**: Custom Codeforces API client with rate limiting and error handling
- **Styling**: Custom CSS utilities for 3D effects, glass morphism, and responsive design
- **Optimization**: Dynamic imports and code splitting for optimal performance

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

## 📱 Responsive Design

TLE Manager is designed to work seamlessly across all devices:

- **Desktop**: Full-featured dashboard with expanded analytics views
- **Tablet**: Responsive grid layouts that adapt to medium screen sizes
- **Mobile**: Collapsible menus and touch-optimized interfaces
- **Dark/Light Mode**: Automatic theme switching based on system preferences or manual toggle

## ⚡ Performance Optimizations

- **Code Splitting**: Components are loaded on demand to minimize initial load time
- **Memoization**: Frequently used calculations are cached to avoid redundant operations
- **Lazy Loading**: Images and charts are loaded only when they enter the viewport
- **Debounced Search**: Search operations are debounced to minimize API calls
- **Virtualized Lists**: Long lists use virtualization to maintain smooth scrolling
- **Local Storage**: Efficient data persistence using browser's local storage

## 🔒 Security Considerations

- **Data Isolation**: All user data is stored locally, not on remote servers
- **No Backend**: No server-side credentials or personal data storage
- **API Limitations**: Respects Codeforces API rate limits to prevent abuse
- **No Tracking**: No user analytics or tracking scripts included

## 🚀 Getting Started

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/kmahesh18/tle.git
   cd tle
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

## 🔍 Troubleshooting

### Common Issues

- **API Rate Limiting**: If you're adding many students at once, you might hit Codeforces API rate limits. Wait a few minutes before trying again.
- **Local Storage Limits**: Browsers typically limit local storage to 5-10MB. If you're tracking many students, consider exporting data regularly.
- **Data Not Syncing**: Ensure you have a stable internet connection when syncing student data.
- **Chart Rendering Issues**: If charts aren't rendering properly, try refreshing the page or switching between tabs.

### Browser Compatibility

TLE Manager works best on modern browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 📝 Notes on Data Storage

TLE Manager uses browser local storage to persist data. This means:

- Data remains available between sessions
- No server-side storage is required
- Data is limited to the browser's local storage capacity
- Data is not shared between devices

For team usage, consider exporting data regularly or implementing a backend server.

## 🔮 Future Enhancements

Planned features for future releases:

- **Multi-platform API Integration**: Support for other competitive programming platforms like AtCoder and LeetCode
- **Team Management**: Group students into classes or teams for better organization
- **Advanced Analytics**: More sophisticated performance metrics and predictive analytics
- **Cloud Sync**: Optional cloud storage for team collaboration
- **PWA Support**: Progressive Web App functionality for offline access

---

<div align="center">
  <p>Made with ❤️ for competitive programming coaches and educators</p>
  <p>
    <a href="#">Demo Video</a> | 
    <a href="https://tle-kohl.vercel.app/">Live Demo</a> |
    <a href="https://github.com/kmahesh18/tle">GitHub Repository</a>
  </p>
</div>

---

## 👨‍💻 About the Developer

<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
  <img src="https://github.com/kmahesh18.png" alt="Mahesh Kumar" style="width: 100px; height: 100px; border-radius: 50%; margin-right: 20px;">
  <div>
    <h3>Mahesh Kumar</h3>
    <p>Passionate developer focused on creating tools for education and competitive programming</p>
  </div>
</div>

### Connect with me

<div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
  <a href="https://github.com/kmahesh18" target="_blank" style="text-decoration: none; color: inherit;">
    <img src="https://img.shields.io/badge/GitHub-kmahesh18-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/mahesh-kumar-0a2b47290/" target="_blank" style="text-decoration: none; color: inherit;">
    <img src="https://img.shields.io/badge/LinkedIn-Mahesh_Kumar-0077B5?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="https://x.com/xnor404" target="_blank" style="text-decoration: none; color: inherit;">
    <img src="https://img.shields.io/badge/X-xnor404-000000?style=for-the-badge&logo=x" alt="X" />
  </a>
  <a href="mailto:maheshkolli888@gmail.com" style="text-decoration: none; color: inherit;">
    <img src="https://img.shields.io/badge/Email-maheshkolli888@gmail.com-D14836?style=for-the-badge&logo=gmail" alt="Email" />
  </a>
  <a href="tel:+919346968655" style="text-decoration: none; color: inherit;">
    <img src="https://img.shields.io/badge/Phone-+91_9346968655-25D366?style=for-the-badge&logo=whatsapp" alt="Phone" />
  </a>
</div>

<p align="center">
  © 2025 Mahesh Kumar. All rights reserved.
</p>
