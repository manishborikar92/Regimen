// Returns date in YYYY-MM-DD format
export function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Returns short day name: "Mon", "Tue", etc.
export function getDayOfWeek(date = new Date()) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

// Returns human-readable date like "Monday, December 22, 2025"
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get date string for a specific date
export function getDateString(date) {
  return date.toISOString().split('T')[0];
}

// Get date X days ago
export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
