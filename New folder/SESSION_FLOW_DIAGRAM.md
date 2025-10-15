# 🔐 Session Management Flow Diagram

## Visual System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│   Visits     │
│   Login Page │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   Enter Email &      │
│   Password           │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Firebase Authentication                                 │
│  ✓ Verify credentials                                   │
│  ✓ Generate JWT token                                   │
│  ✓ Set persistence: browserSessionPersistence           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Session Manager Starts                                  │
│  ✓ Reset activity timer to 30 minutes                   │
│  ✓ Add event listeners (mouse, keyboard, scroll, etc.)  │
│  ✓ Start monitoring loop (check every 60 seconds)       │
│  ✓ Save last activity time to localStorage              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Redirect to Dashboard                                   │
│  ✓ Display session status indicator                     │
│  ✓ Show remaining time if < 5 minutes                   │
└──────┬──────────────────────────────────────────────────┘
       │
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────────┐
│   USER      │   │   NO USER       │
│   ACTIVE    │   │   ACTIVITY      │
│             │   │                 │
│ Any action: │   │ Timer counts    │
│ - Mouse     │   │ down from 30    │
│ - Keyboard  │   │ minutes         │
│ - Scroll    │   │                 │
│ - Touch     │   │                 │
└──────┬──────┘   └────────┬────────┘
       │                   │
       ▼                   ▼
┌─────────────┐   ┌─────────────────────┐
│   RESET     │   │   AFTER 28 MIN      │
│   TIMER     │   │   (Optional)        │
│   to 30 min │   │   ⚠️ Warning         │
└──────┬──────┘   │   "2 min left"      │
       │          └─────────┬───────────┘
       │                    │
       └────────┬───────────┘
                │
                ▼
       ┌─────────────────┐
       │   AFTER 30 MIN  │      NO──────┐
       │   of inactivity?├──────────────┤
       └────────┬────────┘              │
                │ YES                   │
                ▼                       │
       ┌─────────────────────────┐     │
       │  AUTO LOGOUT            │     │
       │  ✓ Stop session manager │     │
       │  ✓ Call Firebase signOut│     │
       │  ✓ Clear localStorage   │     │
       │  ✓ Clear JWT token      │     │
       └────────┬────────────────┘     │
                │                       │
                ▼                       │
       ┌─────────────────────────┐     │
       │  Redirect to Login      │     │
       │  with ?timeout=true     │     │
       └────────┬────────────────┘     │
                │                       │
                ▼                       │
       ┌─────────────────────────┐     │
       │  Display Message:       │     │
       │  "Logged out due to     │     │
       │  30 min inactivity"     │     │
       └─────────────────────────┘     │
                                        │
                                        │
                                        ▼
                                ┌───────────────┐
                                │   CONTINUE    │
                                │   SESSION     │
                                └───────┬───────┘
                                        │
                                        ▼
                                ┌───────────────────┐
                                │   Monitor until   │
                                │   logout or       │
                                │   inactivity      │
                                └───────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     BROWSER CLOSE SCENARIO                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│   Closes     │
│   Browser    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Firebase Auto-Cleanup                                   │
│  ✓ browserSessionPersistence detects browser close      │
│  ✓ Automatically clear JWT token                        │
│  ✓ Remove authentication state                          │
│  ✓ Clear session data                                   │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  User Opens Browser Again                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Visits Dashboard URL                                    │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Auth Check: No Valid Session                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Redirect to Login                                       │
│  (Must login again)                                      │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     COMPONENT INTEGRATION                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  React Component (Dashboard, Admin, etc.)                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  import { useSessionManager }                            │
│  from '@/hooks/useSessionManager'                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  const sessionStatus = useSessionManager(                │
│    isAuthenticated,                                      │
│    {                                                     │
│      showWarning: true,                                  │
│      onWarning: () => { /* custom */ },                  │
│      onLogout: () => { /* custom */ },                   │
│      redirectPath: '/employee/login'                     │
│    }                                                     │
│  );                                                      │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Access Session Info:                                    │
│  • sessionStatus.isActive                               │
│  • sessionStatus.remainingMinutes                       │
│  • sessionStatus.showingWarning                         │
│  • sessionStatus.resetTimer()                           │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Firebase Configuration
┌─────────────────────────────────────────────────────────┐
│  browserSessionPersistence                               │
│  ✓ Session cleared on browser close                     │
│  ✓ No localStorage persistence (was 14 days)            │
│  ✓ JWT not stored permanently                           │
└─────────────────────────────────────────────────────────┘

Layer 2: Activity Monitoring
┌─────────────────────────────────────────────────────────┐
│  SessionManager                                          │
│  ✓ Tracks 7 types of user activity                      │
│  ✓ Updates last activity timestamp                      │
│  ✓ Stores in localStorage (cleared on logout)           │
└─────────────────────────────────────────────────────────┘

Layer 3: Inactivity Detection
┌─────────────────────────────────────────────────────────┐
│  Periodic Checks (every 60 seconds)                     │
│  ✓ Compare current time with last activity              │
│  ✓ If > 30 minutes: trigger logout                      │
│  ✓ If > 28 minutes: show warning (optional)             │
└─────────────────────────────────────────────────────────┘

Layer 4: Automatic Cleanup
┌─────────────────────────────────────────────────────────┐
│  On Logout/Timeout                                       │
│  ✓ Firebase signOut()                                   │
│  ✓ Clear localStorage                                   │
│  ✓ Remove event listeners                               │
│  ✓ Stop monitoring timers                               │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        ACTIVITY EVENTS                               │
└─────────────────────────────────────────────────────────────────────┘

Monitored Events:
┌────────────┬──────────────────────────────────────────┐
│ Event      │ Description                              │
├────────────┼──────────────────────────────────────────┤
│ mousedown  │ User clicks mouse button                 │
│ mousemove  │ User moves mouse                         │
│ keypress   │ User presses a key                       │
│ scroll     │ User scrolls page                        │
│ touchstart │ User touches screen (mobile/tablet)      │
│ click      │ User clicks element                      │
│ keydown    │ User presses key down                    │
└────────────┴──────────────────────────────────────────┘

Each Event:
  ↓
Updates Last Activity Time
  ↓
Resets 30-minute Timer
  ↓
Session Extended


┌─────────────────────────────────────────────────────────────────────┐
│                        TIMING DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────┘

Login                                                        Logout
  │                                                             │
  ├─────────────────────────────────────────────────────────────┤
  │                      30 Minutes                            │
  │                                                             │
  │                                                             │
  ├─────────────┬─────────────┬─────────────┬─────────────────┤
  0 min       7.5 min      15 min       22.5 min         30 min
  │             │             │             │                  │
  │             │             │             │                  ▼
  │             │             │             │           ⚠️ Warning
  │             │             │             │           (28 min)
  │             │             │             │                  │
  │             │             │             │                  ▼
  │             │             │             │           🚪 Auto Logout
  │             │             │             │           (30 min)
  │             │             │             │
  ▼             ▼             ▼             ▼
User Activity Resets Timer to 30 min


┌─────────────────────────────────────────────────────────────────────┐
│                        FILE STRUCTURE                                │
└─────────────────────────────────────────────────────────────────────┘

src/
├── lib/
│   ├── sessionManager.ts      ← Core logic (NEW)
│   ├── firebase.ts             ← Updated with browserSessionPersistence
│   └── auth.ts                 ← Integrated with session manager
│
├── hooks/
│   └── useSessionManager.ts   ← React hook (NEW)
│
└── app/
    └── employee/
        ├── login/
        │   └── page.tsx       ← Shows timeout message
        ├── dashboard/
        │   └── page.tsx       ← Uses session monitoring
        └── admin/
            └── page.tsx       ← Uses session monitoring


┌─────────────────────────────────────────────────────────────────────┐
│                   BEFORE vs AFTER COMPARISON                         │
└─────────────────────────────────────────────────────────────────────┘

BEFORE:
┌────────────────────────────────────────────────────────────┐
│  ❌ User stayed logged in for 14 days                      │
│  ❌ Session persisted even after browser close             │
│  ❌ No inactivity timeout                                  │
│  ❌ JWT stored in localStorage permanently                 │
│  ❌ Security risk: abandoned sessions                      │
└────────────────────────────────────────────────────────────┘

AFTER:
┌────────────────────────────────────────────────────────────┐
│  ✅ Auto logout after 30 min inactivity                    │
│  ✅ Session cleared on browser close                       │
│  ✅ Activity monitoring (mouse, keyboard, etc.)            │
│  ✅ JWT cleared automatically                              │
│  ✅ Secure: multiple layers of protection                  │
└────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        SUMMARY                                       │
└─────────────────────────────────────────────────────────────────────┘

✅ Session Management Features:
   • 30-minute inactivity timeout
   • Activity tracking (7 event types)
   • Automatic logout & JWT clearing
   • Browser session only (no 14-day persistence)
   • Optional warnings before timeout
   • Visual session status indicators
   • User-friendly timeout messages

✅ Security Benefits:
   • Protection against session hijacking
   • No abandoned sessions
   • Automatic token cleanup
   • Multi-layer security approach
   • Zero Trust validation

✅ Developer Experience:
   • Easy integration with React hook
   • Highly configurable
   • TypeScript support
   • Comprehensive documentation
   • Production ready

🎉 Your authentication system is now secure and robust!
