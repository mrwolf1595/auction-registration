# 🔐 Enhanced Session Management System

## Overview

A comprehensive session management system has been implemented that provides:
- ✅ Automatic session expiration after 30 minutes of inactivity
- ✅ User activity tracking (mouse movement, typing, clicks, etc.)
- ✅ Automatic logout on session expiration
- ✅ Optional warning 2 minutes before session expires
- ✅ Firebase configuration to prevent sessions from persisting after browser closure
- ✅ Automatic clearing of cookies and JWT tokens

---

## 🏗️ Technical Architecture

### 1. **Session Manager** - `src/lib/sessionManager.ts`

This file provides a `SessionManager` class that monitors user activity and manages session expiration.

#### Key Features:
- **Activity Tracking**: Monitors mouse, keyboard, and scroll events
- **Inactivity Timer**: 30 minutes (customizable)
- **Periodic Checks**: Validates session status every minute
- **Local Storage**: Saves last activity time in localStorage
- **Automatic Cleanup**: Removes listeners and timers when monitoring stops

#### Monitored Events:
```javascript
const ACTIVITY_EVENTS = [
  'mousedown',   // Mouse click
  'mousemove',   // Mouse movement
  'keypress',    // Key press
  'scroll',      // Scrolling
  'touchstart',  // Touch (for tablets)
  'click',       // Click
  'keydown',     // Key down
];
```

#### Default Settings:
```javascript
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 2 * 60 * 1000;         // Warning 2 minutes before
const CHECK_INTERVAL = 60 * 1000;            // Check every minute
```

---

### 2. **Firebase Configuration** - `src/lib/firebase.ts`

Firebase Auth is configured to use `browserSessionPersistence`:

```typescript
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

// Configure session persistence for browser only
setPersistence(auth, browserSessionPersistence)
```

#### What This Means:
- ✅ Session persists only during current browser session
- ✅ Authentication is automatically cleared when closing browser/tab
- ✅ User won't stay logged in for 14 days
- ✅ JWT is not permanently stored in localStorage

---

### 3. **React Hook** - `src/hooks/useSessionManager.ts`

Provides an easy interface to integrate session management into React components.

#### Basic Usage:
```typescript
const sessionStatus = useSessionManager(isAuthenticated, {
  showWarning: true,          // Show warning before expiration
  onWarning: () => {
    // Custom warning handler
    console.warn('Session expiring soon!');
  },
  onLogout: () => {
    // Custom handler before logout
    console.log('Logging out...');
  },
  redirectPath: '/employee/login',
  enabled: true,              // Enable/disable system
});
```

#### Available Properties:
```typescript
interface SessionStatus {
  isActive: boolean;           // Is monitoring active
  remainingMinutes: number;    // Remaining time in minutes
  showingWarning: boolean;     // Is warning being displayed
  resetTimer: () => void;      // Reset timer manually
}
```

---

### 4. **Authentication Updates** - `src/lib/auth.ts`

Session manager is integrated with authentication functions:

```typescript
// On logout
export const signOutEmployee = async (): Promise<void> => {
  // Stop session monitoring
  sessionManager.stopMonitoring();
  
  // Sign out from Firebase
  await signOut(auth);
};
```

---

## 📝 Usage Guide

### In Dashboard Page:

```typescript
import { useSessionManager } from '@/hooks/useSessionManager';

export default function DashboardPage() {
  const [employee, setEmployee] = useState<EmployeeUser | null>(null);
  
  // Enable session management
  const sessionStatus = useSessionManager(!!employee, {
    showWarning: true,
    onWarning: () => {
      // Show notification to user
      toast.warning('Session will expire in 2 minutes!');
    },
    onLogout: () => {
      // Clean up local data
      localStorage.clear();
    },
    redirectPath: '/employee/login',
  });

  return (
    <div>
      {/* Display session status */}
      {sessionStatus.isActive && (
        <div>
          <p>Session Active</p>
          <p>Time Remaining: {sessionStatus.remainingMinutes} minutes</p>
        </div>
      )}
    </div>
  );
}
```

### In Login Page:

Timeout message handling has been added:

```typescript
const searchParams = useSearchParams();

useEffect(() => {
  // Check if logged out due to timeout
  const timeout = searchParams.get('timeout');
  if (timeout === 'true') {
    setTimeoutMessage('Automatically logged out due to 30 minutes of inactivity');
  }
}, [searchParams]);
```

---

## 🎯 Workflow

### 1. Login:
```
User → Login → Firebase Auth → Set Session
                      ↓
            Start Session Monitoring (30 minutes)
```

### 2. Activity:
```
User Activity → Update Last Activity Time → Save to localStorage
                              ↓
                    Reset Timer (30 minutes)
```

### 3. Inactivity:
```
28 minutes inactivity → Optional Warning (2 minutes remaining)
         ↓
30 minutes inactivity → Automatic Logout
         ↓
Redirect to Login Page (with timeout message)
```

### 4. Browser Closure:
```
Close Browser/Tab → Firebase automatically clears session
                          ↓
                   No saved JWT
                          ↓
               Must login again
```

---

## 🔧 Customization

### Change Timeout Duration:

In `src/lib/sessionManager.ts`:
```typescript
// Change from 30 minutes to 15 minutes
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
```

### Disable Warning:

```typescript
useSessionManager(isAuthenticated, {
  showWarning: false,  // No warning
});
```

### Custom Redirect Path:

```typescript
useSessionManager(isAuthenticated, {
  redirectPath: '/custom/login',
});
```

### Add Additional Monitoring Events:

In `src/lib/sessionManager.ts`:
```typescript
const ACTIVITY_EVENTS = [
  ...existingEvents,
  'wheel',        // Mouse wheel
  'resize',       // Window resize
  'focus',        // Window focus
];
```

---

## 🧪 Testing

### Test Session Expiration:

1. **Temporarily reduce duration**:
```typescript
// For testing only - 2 minutes instead of 30
const INACTIVITY_TIMEOUT = 2 * 60 * 1000;
```

2. **Login** to dashboard
3. **Don't perform any activity** for 2 minutes
4. **Verify** automatic logout

### Test Warning:

1. Enable `showWarning: true`
2. Wait until 2 minutes remain
3. Verify warning is displayed

### Test Timer Reset:

1. Login
2. Wait 25 minutes
3. Move mouse (activity)
4. Verify timer resets to 30 minutes

---

## 📊 Performance

- ✅ **Low Performance Impact**: Checks only every minute
- ✅ **Passive Listeners**: `{ passive: true }` to not block scrolling
- ✅ **Automatic Cleanup**: Removes listeners on component unmount
- ✅ **Optimal Memory Usage**: Single instance only (singleton)

---

## 🔒 Security

### What Was Achieved:

✅ **No Long-Lived Sessions**: 30 minutes maximum without activity
✅ **Automatic Clearing**: JWT and cookies cleared automatically
✅ **No Session Persistence**: No permanent storage in localStorage
✅ **Browser Session Only**: Expires on browser closure
✅ **Session Hijacking Protection**: Automatic expiration after inactivity

### Best Practices Applied:

1. **Principle of Least Privilege**: Short-lived sessions
2. **Defense in Depth**: Multiple layers of protection
3. **Secure by Default**: Secure settings by default
4. **Zero Trust**: Continuous session validation

---

## 🚀 Maintenance and Future Development

### Improvement Possibilities:

1. **Add Notifications**: Toast system for alerts
2. **Cloud Storage**: Save session state in Firestore
3. **Analytics**: Track session usage patterns
4. **Multi-Device Sessions**: Sync across devices
5. **Automatic Extension**: Option to automatically extend session on activity

### Monitoring Points:

- 📊 Average session duration
- 📊 Timeout rate
- 📊 Peak usage times
- 📊 Re-login rate

---

## 📚 References and Resources

### Firebase Documentation:
- [Firebase Auth Session Management](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

### Security Standards:
- [OWASP Session Management](https://owasp.org/www-community/controls/Session_Management)
- [NIST Authentication Guidelines](https://pages.nist.gov/800-63-3/)

---

## ✅ Summary

A comprehensive session management system has been implemented that provides:

1. ✅ **Automatic expiration after 30 minutes of inactivity**
2. ✅ **Comprehensive user activity tracking**
3. ✅ **Automatic logout and redirection**
4. ✅ **Secure Firebase configuration (browserSessionPersistence)**
5. ✅ **No persistence of JWT or cookies after browser closure**
6. ✅ **Easy-to-use interface with React Hooks**
7. ✅ **Visual indicators for session status**
8. ✅ **Clear messages on timeout**

The system is production-ready and provides enhanced security against:
- Session Hijacking
- Unauthorized Access
- Abandoned Sessions

---

## 🎉 Implementation Details

### Files Created/Modified:

1. **Created**: `src/lib/sessionManager.ts` - Core session management logic
2. **Modified**: `src/lib/firebase.ts` - Added browserSessionPersistence
3. **Modified**: `src/lib/auth.ts` - Integrated session manager
4. **Created**: `src/hooks/useSessionManager.ts` - React hook for session management
5. **Modified**: `src/app/employee/login/page.tsx` - Added timeout message
6. **Modified**: `src/app/employee/dashboard/page.tsx` - Added session monitoring
7. **Modified**: `src/app/employee/admin/page.tsx` - Added session monitoring

### Key Changes:

#### Firebase Persistence:
- Changed from default (localStorage persistence for 14 days)
- To: browserSessionPersistence (session only, cleared on browser close)

#### Session Monitoring:
- Tracks 7 types of user activity events
- Checks every minute for inactivity
- Automatically logs out after 30 minutes of no activity
- Optional warning at 28 minutes

#### User Experience:
- Visual session status indicator in dashboard
- Clear timeout message on login page after auto-logout
- Remaining time display when session is about to expire

---

## 🎯 Quick Start

### For Developers:

1. **Session management is automatic** - no manual intervention needed
2. **Already integrated** in all protected pages
3. **Customize if needed** using the options in `useSessionManager` hook

### For Users:

1. **Login normally** - session starts automatically
2. **Stay active** - any interaction resets the timer
3. **Inactive for 30 minutes?** - automatic logout
4. **Close browser?** - must login again (no persistent session)

---

## 🎉 Congratulations!

A secure and efficient session management system has been implemented! 🚀

For more information or support, refer to the files:
- `src/lib/sessionManager.ts`
- `src/hooks/useSessionManager.ts`
- `src/lib/firebase.ts`
- `src/lib/auth.ts`
