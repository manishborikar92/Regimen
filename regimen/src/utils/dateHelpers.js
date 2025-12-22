// Returns date in YYYY-MM-DD format
export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get date X days ago
export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
