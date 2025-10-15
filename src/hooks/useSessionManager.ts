/**
 * React Hook for Session Management
 * 
 * This hook provides easy integration of the session management system
 * into React components. It automatically handles:
 * - Starting session monitoring when user is authenticated
 * - Stopping monitoring on component unmount
 * - Optional warning before session expiration
 * - Automatic logout on session expiration
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/sessionManager';
import { signOutEmployee } from '@/lib/auth';

export interface UseSessionManagerOptions {
  /**
   * Whether to show a warning before session expires
   * Default: false
   */
  showWarning?: boolean;
  
  /**
   * Custom warning callback
   */
  onWarning?: () => void;
  
  /**
   * Custom logout callback (called before Firebase signOut)
   */
  onLogout?: () => void;
  
  /**
   * Redirect path after logout
   * Default: '/employee/login'
   */
  redirectPath?: string;
  
  /**
   * Whether to enable session monitoring
   * Set to false to disable (useful for testing)
   * Default: true
   */
  enabled?: boolean;
}

export interface SessionStatus {
  /**
   * Whether session monitoring is active
   */
  isActive: boolean;
  
  /**
   * Remaining time in minutes until session expires
   */
  remainingMinutes: number;
  
  /**
   * Whether a warning is currently being shown
   */
  showingWarning: boolean;
  
  /**
   * Reset the session timer manually
   */
  resetTimer: () => void;
}

export function useSessionManager(
  isAuthenticated: boolean,
  options: UseSessionManagerOptions = {}
): SessionStatus {
  const router = useRouter();
  const [showingWarning, setShowingWarning] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(30);

  const {
    showWarning = false,
    onWarning,
    onLogout,
    redirectPath = '/employee/login',
    enabled = true,
  } = options;

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    console.log('Session expired - logging out user');
    
    // Call custom logout callback if provided
    if (onLogout) {
      onLogout();
    }
    
    try {
      // Sign out from Firebase
      await signOutEmployee();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Redirect to login page
      router.push(`${redirectPath}?timeout=true`);
    }
  }, [onLogout, router, redirectPath]);

  // Handle session warning
  const handleSessionWarning = useCallback(() => {
    console.log('Session expiring soon - showing warning');
    setShowingWarning(true);
    
    // Call custom warning callback if provided
    if (onWarning) {
      onWarning();
    }
  }, [onWarning]);

  // Reset timer manually
  const resetTimer = useCallback(() => {
    sessionManager.resetTimer();
    setShowingWarning(false);
    setRemainingMinutes(30);
  }, []);

  // Update remaining time periodically
  useEffect(() => {
    if (!isAuthenticated || !enabled) {
      return;
    }

    const updateInterval = setInterval(() => {
      const remaining = sessionManager.getRemainingMinutes();
      setRemainingMinutes(remaining);
      
      // Clear warning if user became active again
      if (remaining > 2 && showingWarning) {
        setShowingWarning(false);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [isAuthenticated, enabled, showingWarning]);

  // Start/stop monitoring based on authentication status
  useEffect(() => {
    if (!enabled) {
      console.log('Session manager disabled by option');
      return;
    }

    if (isAuthenticated) {
      console.log('Starting session monitoring...');
      
      // Start monitoring with callbacks
      sessionManager.startMonitoring(
        showWarning ? handleSessionWarning : undefined,
        handleSessionExpired
      );
      
      // Set initial remaining time
      setRemainingMinutes(sessionManager.getRemainingMinutes());
      
      return () => {
        console.log('Stopping session monitoring...');
        sessionManager.stopMonitoring();
      };
    } else {
      // User is not authenticated, ensure monitoring is stopped
      sessionManager.stopMonitoring();
      setShowingWarning(false);
    }
  }, [isAuthenticated, enabled, showWarning, handleSessionWarning, handleSessionExpired]);

  return {
    isActive: isAuthenticated && enabled,
    remainingMinutes,
    showingWarning,
    resetTimer,
  };
}
