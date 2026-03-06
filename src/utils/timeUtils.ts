/**
 * Time Utility Functions
 *
 * Helper functions for formatting time in a human-readable way
 * Works consistently on both iOS and Android
 */

/**
 * Convert a date string to relative time format
 * e.g., "1 min ago", "2 days ago", "1 week ago"
 *
 * @param dateString - Date string from API (format: "YYYY-MM-DD HH:mm")
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  // Handle "Just now" for optimistic updates
  if (dateString === 'Just now') {
    return dateString;
  }

  // Handle empty or invalid input
  if (!dateString || typeof dateString !== 'string') {
    return dateString || '';
  }

  // Trim whitespace
  const trimmed = dateString.trim();

  // Check if it matches expected format "YYYY-MM-DD HH:mm"
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  
  if (!match) {
    // Not in expected format, return as-is
    return dateString;
  }

  const apiYear = parseInt(match[1], 10);
  const apiMonth = parseInt(match[2], 10);
  const apiDay = parseInt(match[3], 10);
  const apiHour = parseInt(match[4], 10);
  const apiMinute = parseInt(match[5], 10);

  // Get current local time components
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1; // getMonth() is 0-indexed
  const nowDay = now.getDate();
  const nowHour = now.getHours();
  const nowMinute = now.getMinutes();
  const nowSecond = now.getSeconds();

  // Calculate total minutes from a fixed reference point
  // This avoids any Date parsing issues on iOS
  const getMinutesSinceEpoch = (y: number, m: number, d: number, h: number, min: number): number => {
    // Days in each month (will adjust for leap year)
    const getDaysInMonth = (year: number, month: number): number => {
      const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month === 2) {
        // Check leap year
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        return isLeap ? 29 : 28;
      }
      return days[month - 1];
    };

    let totalDays = 0;
    
    // Add days for complete years since 2020 (arbitrary reference)
    for (let yr = 2020; yr < y; yr++) {
      const isLeap = (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
      totalDays += isLeap ? 366 : 365;
    }
    
    // Add days for complete months in current year
    for (let mo = 1; mo < m; mo++) {
      totalDays += getDaysInMonth(y, mo);
    }
    
    // Add days in current month
    totalDays += d - 1;
    
    // Convert to minutes and add hours/minutes
    return totalDays * 24 * 60 + h * 60 + min;
  };

  const apiMinutes = getMinutesSinceEpoch(apiYear, apiMonth, apiDay, apiHour, apiMinute);
  const nowMinutes = getMinutesSinceEpoch(nowYear, nowMonth, nowDay, nowHour, nowMinute);
  
  // Calculate difference in minutes
  let diffMinutes = nowMinutes - apiMinutes;
  
  // Add partial minute from seconds
  const diffSeconds = diffMinutes * 60 + nowSecond;

  // Handle future dates (within 2 minute tolerance for clock sync issues)
  if (diffMinutes < -2) {
    return dateString;
  }
  
  // Normalize negative small differences to 0
  if (diffMinutes < 0) {
    diffMinutes = 0;
  }

  // Calculate relative time
  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} mins ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

export default getRelativeTime;