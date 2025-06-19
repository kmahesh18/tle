const CF_API_BASE = 'https://codeforces.com/api'

// Codeforces API client with rate limiting and error handling
class CodeforcesAPI {
  constructor() {
    this.rateLimitDelay = 1000 // 1 second between requests
    this.lastRequestTime = 0
  }

  async makeRequest(endpoint) {
    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      )
    }
    this.lastRequestTime = Date.now()

    try {
      const response = await fetch(`${CF_API_BASE}${endpoint}`)
      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(data.comment || 'API request failed')
      }
      
      return data.result
    } catch (error) {
      console.error('Codeforces API Error:', error)
      throw error
    }
  }

  async getUserInfo(handle) {
    return this.makeRequest(`/user.info?handles=${handle}`)
  }

  async getUserSubmissions(handle, from = 1, count = 10000) {
    return this.makeRequest(`/user.status?handle=${handle}&from=${from}&count=${count}`)
  }

  async getUserRating(handle) {
    return this.makeRequest(`/user.rating?handle=${handle}`)
  }

  async getContestList() {
    return this.makeRequest('/contest.list')
  }

  async getProblemset() {
    return this.makeRequest('/problemset.problems')
  }

  // Helper methods for data processing
  processUserData(userData, submissions, ratingHistory) {
    const user = userData[0]
    
    // Calculate statistics
    const solvedProblems = this.getUniqueSolvedProblems(submissions)
    const ratingStats = this.calculateRatingStats(ratingHistory)
    const activityStats = this.calculateActivityStats(submissions)
    
    return {
      handle: user.handle,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      country: user.country || '',
      city: user.city || '',
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      maxRank: user.maxRank || 'unrated',
      avatar: user.avatar || '',
      titlePhoto: user.titlePhoto || '',
      lastOnlineTime: user.lastOnlineTimeSeconds ? new Date(user.lastOnlineTimeSeconds * 1000) : null,
      registrationTime: new Date(user.registrationTimeSeconds * 1000),
      
      // Calculated stats
      solvedCount: solvedProblems.length,
      averageRating: this.calculateAverageRating(solvedProblems),
      ratingHistory: ratingHistory,
      currentStreak: activityStats.currentStreak,
      longestStreak: activityStats.longestStreak,
      lastSubmissionTime: activityStats.lastSubmissionTime,
      
      // Raw data for detailed analysis
      submissions: submissions,
      solvedProblems: solvedProblems,
    }
  }

  getUniqueSolvedProblems(submissions) {
    const solved = new Map()
    
    submissions
      .filter(sub => sub.verdict === 'OK')
      .forEach(sub => {
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`
        if (!solved.has(problemKey)) {
          solved.set(problemKey, {
            ...sub.problem,
            solvedAt: new Date(sub.creationTimeSeconds * 1000),
            contestId: sub.problem.contestId,
            index: sub.problem.index,
          })
        }
      })
    
    return Array.from(solved.values())
  }

  calculateRatingStats(ratingHistory) {
    if (!ratingHistory || ratingHistory.length === 0) {
      return { min: 0, max: 0, current: 0, contests: 0 }
    }

    const ratings = ratingHistory.map(contest => contest.newRating)
    return {
      min: Math.min(...ratings),
      max: Math.max(...ratings),
      current: ratings[ratings.length - 1],
      contests: ratingHistory.length,
    }
  }

  calculateActivityStats(submissions) {
    if (!submissions || submissions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastSubmissionTime: null }
    }

    // Sort submissions by time
    const sortedSubmissions = submissions
      .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds)

    const lastSubmissionTime = new Date(sortedSubmissions[0].creationTimeSeconds * 1000)
    
    // Calculate streaks (consecutive days with submissions)
    const submissionDates = new Set()
    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000).toDateString()
      submissionDates.add(date)
    })

    const uniqueDates = Array.from(submissionDates).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1])
      const currDate = new Date(uniqueDates[i])
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24)

      if (dayDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate current streak
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      // Work backwards from today to find current streak
      const todayTime = new Date().getTime()
      let streakCount = 0
      
      for (let i = 0; i < 365; i++) { // Check up to a year back
        const checkDate = new Date(todayTime - i * 24 * 60 * 60 * 1000).toDateString()
        if (uniqueDates.includes(checkDate)) {
          streakCount++
        } else if (streakCount > 0) {
          break
        }
      }
      currentStreak = streakCount
    }

    return {
      currentStreak,
      longestStreak,
      lastSubmissionTime,
    }
  }

  calculateAverageRating(solvedProblems) {
    if (!solvedProblems || solvedProblems.length === 0) return 0
    
    const ratedProblems = solvedProblems.filter(p => p.rating)
    if (ratedProblems.length === 0) return 0
    
    const totalRating = ratedProblems.reduce((sum, p) => sum + p.rating, 0)
    return Math.round(totalRating / ratedProblems.length)
  }

  getProblemsInPeriod(submissions, days) {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
    return submissions.filter(sub => 
      sub.creationTimeSeconds * 1000 >= cutoffTime && sub.verdict === 'OK'
    )
  }

  getRatingDistribution(solvedProblems) {
    const buckets = {
      '800-999': 0,
      '1000-1199': 0,
      '1200-1399': 0,
      '1400-1599': 0,
      '1600-1799': 0,
      '1800-1999': 0,
      '2000-2199': 0,
      '2200-2399': 0,
      '2400+': 0,
    }

    solvedProblems.forEach(problem => {
      if (!problem.rating) return
      
      const rating = problem.rating
      if (rating < 1000) buckets['800-999']++
      else if (rating < 1200) buckets['1000-1199']++
      else if (rating < 1400) buckets['1200-1399']++
      else if (rating < 1600) buckets['1400-1599']++
      else if (rating < 1800) buckets['1600-1799']++
      else if (rating < 2000) buckets['1800-1999']++
      else if (rating < 2200) buckets['2000-2199']++
      else if (rating < 2400) buckets['2200-2399']++
      else buckets['2400+']++
    })

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }))
  }
}

export const codeforcesAPI = new CodeforcesAPI()
