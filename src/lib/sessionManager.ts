/**
 * Session Management System with 30-minute Inactivity Timeout
 * 
 * This module provides automatic session expiration based on user inactivity.
 * Features:
 * - 30-minute inactivity timeout
 * - Tracks mouse movements, keyboard input, and touch events
 * - Automatic logout on timeout
 * - Warning before logout (optional)
 * - Session persistence across page refreshes
 */

import { signOut } from 'firebase/auth';
import { auth } from './firebase';

// Session configuration
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before timeout (optional warning)
const STORAGE_KEY = 'lastActivityTime';
const CHECK_INTERVAL = 60 * 1000; // Check every minute

// Activity events to track
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown',
];

export class SessionManager {
  private lastActivityTime: number;
  private timeoutCheckInterval: NodeJS.Timeout | null = null;
  private warningCallback: (() => void) | null = null;
  private logoutCallback: (() => void) | null = null;
  private isMonitoring = false;

  constructor() {
    this.lastActivityTime = Date.now();
    this.loadLastActivityFromStorage();
  }

  /**
   * Start monitoring user activity
   */
  public startMonitoring(
    onWarning?: () => void,
    onLogout?: () => void
  ): void {
    if (this.isMonitoring) {
      console.log('Session manager already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.warningCallback = onWarning || null;
    this.logoutCallback = onLogout || null;

    // Update activity time
    this.updateActivity();

    // Add event listeners for user activity
    this.addActivityListeners();

    // Start checking for inactivity
    this.startInactivityCheck();

    console.log('Session manager started - 30 minute inactivity timeout active');
  }

  /**
   * Stop monitoring user activity
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    // Remove event listeners
    this.removeActivityListeners();

    // Clear interval
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }

    // Clear storage
    this.clearStorage();

    console.log('Session manager stopped');
  }

  /**
   * Update last activity time
   */
  private updateActivity = (): void => {
    this.lastActivityTime = Date.now();
    this.saveLastActivityToStorage();
  };

  /**
   * Add event listeners for user activity
   */
  private addActivityListeners(): void {
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, this.updateActivity, { passive: true });
    });
  }

  /**
   * Remove event listeners for user activity
   */
  private removeActivityListeners(): void {
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, this.updateActivity);
    });
  }

  /**
   * Start checking for inactivity periodically
   */
  private startInactivityCheck(): void {
    this.timeoutCheckInterval = setInterval(() => {
      this.checkInactivity();
    }, CHECK_INTERVAL);

    // Also check immediately
    this.checkInactivity();
  }

  /**
   * Check if user has been inactive for too long
   */
  private checkInactivity(): void {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;

    // Check if session has expired
    if (inactiveTime >= INACTIVITY_TIMEOUT) {
      console.warn('Session expired due to inactivity');
      this.handleSessionExpired();
      return;
    }

    // Check if warning should be shown (2 minutes before timeout)
    if (
      this.warningCallback &&
      inactiveTime >= INACTIVITY_TIMEOUT - WARNING_TIME &&
      inactiveTime < INACTIVITY_TIMEOUT
    ) {
      const remainingMinutes = Math.ceil(
        (INACTIVITY_TIMEOUT - inactiveTime) / 60000
      );
      console.log(`Session expiring in ${remainingMinutes} minute(s)`);
      this.warningCallback();
    }
  }

  /**
   * Handle session expiration
   */
  private async handleSessionExpired(): Promise<void> {
    // Stop monitoring
    this.stopMonitoring();

    // Call logout callback first (for UI updates)
    if (this.logoutCallback) {
      this.logoutCallback();
    }

    // Sign out from Firebase
    try {
      if (auth) {
        await signOut(auth);
        console.log('User signed out due to inactivity');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Save last activity time to localStorage
   */
  private saveLastActivityToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.lastActivityTime.toString());
    } catch (error) {
      console.error('Error saving activity time:', error);
    }
  }

  /**
   * Load last activity time from localStorage
   */
  private loadLastActivityFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedTime = parseInt(stored, 10);
        // Only use stored time if it's recent (within timeout period)
        const now = Date.now();
        if (now - storedTime < INACTIVITY_TIMEOUT) {
          this.lastActivityTime = storedTime;
        }
      }
    } catch (error) {
      console.error('Error loading activity time:', error);
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get remaining time until session expires (in milliseconds)
   */
  public getRemainingTime(): number {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;
    const remaining = INACTIVITY_TIMEOUT - inactiveTime;
    return Math.max(0, remaining);
  }

  /**
   * Get remaining time until session expires (in minutes)
   */
  public getRemainingMinutes(): number {
    return Math.ceil(this.getRemainingTime() / 60000);
  }

  /**
   * Reset the session timer (useful for manual activity tracking)
   */
  public resetTimer(): void {
    this.updateActivity();
    console.log('Session timer reset');
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
