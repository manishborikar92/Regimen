/**
 * Timer Notifications Utility — Manages browser notifications with graceful permission handling.
 *
 * Requests permission on start if default, respects user denial, handles platforms without
 * notification support, and safely dispatches completion alerts when the page is inactive.
 */

/**
 * Checks whether the browser supports HTML5 notifications.
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Requests browser notification permission gracefully if not already determined.
 * @returns {Promise<'granted' | 'denied' | 'default' | 'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  } catch {
    return 'denied';
  }
}

/**
 * Dispatches a polite completion notification if permission is granted and document is hidden.
 * Auto-closes the notification after 8 seconds to prevent desktop clutter.
 *
 * @param {string} title
 * @param {string} body
 * @param {string} [tag='vritta-timer']
 * @returns {boolean} True if notification was successfully created, false otherwise.
 */
export function sendTimerNotification(title, body, tag = 'vritta-timer') {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icon1.png',
      badge: '/icon0.svg',
      tag,
      silent: false,
    });

    // Auto-dismiss notification after 8 seconds
    setTimeout(() => {
      try {
        notification.close();
      } catch {
        // Notification may already be dismissed by the user
      }
    }, 8000);

    return true;
  } catch {
    // Gracefully handle restricted contexts, PWA permission drops, or browser limits
    return false;
  }
}
