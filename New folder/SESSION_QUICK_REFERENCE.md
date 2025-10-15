# ⚡ Session Management - Quick Reference

## 🎯 What You Asked For

> "I want if the user still interactive for 30 min remove its cookies or jwt and must relogin again"

## ✅ What Was Delivered

1. **30-minute inactivity timeout** - User automatically logged out after 30 minutes of no activity
2. **JWT/Cookie clearing** - All authentication tokens cleared automatically
3. **No 14-day persistence** - Session only lasts during browser session
4. **Activity tracking** - Mouse, keyboard, scroll events reset the timer

---

## 🚀 Quick Start

### For Testing (2 minutes instead of 30):

**Edit**: `src/lib/sessionManager.ts`

```typescript
// Change line 17:
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes for testing
```

Then:
1. Login to dashboard
2. Don't touch anything for 2 minutes
3. ✅ You'll be logged out automatically

**Don't forget to change back to 30 minutes for production!**

---

## 📁 Key Files

### Core Files (Don't delete these):
```
✅ src/lib/sessionManager.ts          - Session management logic
✅ src/hooks/useSessionManager.ts     - React hook
✅ src/lib/firebase.ts                - Firebase configuration
✅ src/lib/auth.ts                    - Authentication
```

### Documentation:
```
📖 SESSION_MANAGEMENT_SUMMARY.md      - Implementation summary
📖 SESSION_MANAGEMENT_DOCUMENTATION.md - Full docs (Arabic)
📖 SESSION_MANAGEMENT_EN.md           - Full docs (English)
📖 SESSION_FLOW_DIAGRAM.md            - Visual diagrams
```

---

## ⚙️ Common Configurations

### Change Timeout Duration

**File**: `src/lib/sessionManager.ts` (line 17)

```typescript
// 15 minutes
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// 45 minutes
const INACTIVITY_TIMEOUT = 45 * 60 * 1000;

// 1 hour
const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
```

### Disable Session Monitoring

**In your component**:

```typescript
useSessionManager(isAuthenticated, {
  enabled: false,  // Disable session monitoring
});
```

### Custom Timeout Message

**File**: `src/app/employee/login/page.tsx`

Change the Arabic message on line ~22:
```typescript
setTimeoutMessage('Your custom message here');
```

---

## 🧪 Testing Checklist

- [ ] Login to dashboard
- [ ] Verify "الجلسة نشطة" appears in header
- [ ] Wait for inactivity timeout
- [ ] Verify auto-logout happens
- [ ] Verify redirect to login with timeout message
- [ ] Close browser and reopen
- [ ] Verify must login again (no persistent session)

---

## 🐛 Troubleshooting

### Problem: Logged out too quickly
**Solution**: Check `INACTIVITY_TIMEOUT` in `src/lib/sessionManager.ts`

### Problem: Not logging out after 30 min
**Solution**: 
1. Check browser console for errors
2. Verify `useSessionManager` is called in component
3. Clear browser cache and try again

### Problem: Session persists after browser close
**Solution**: 
1. Verify `browserSessionPersistence` in `src/lib/firebase.ts`
2. Clear all browser data (Ctrl+Shift+Delete)
3. Try in incognito mode

---

## 📊 How It Works (Simple)

```
User Active → Timer Resets → 30 min countdown starts
                ↓
User Inactive → Timer counts down
                ↓
30 minutes pass → Auto Logout → Clear JWT → Redirect
```

---

## 🔐 Security Features

✅ **Auto-logout** after 30 minutes  
✅ **JWT cleared** on logout  
✅ **Session cleared** on browser close  
✅ **Activity tracking** resets timer  
✅ **Visual indicators** for session status  
✅ **User-friendly** timeout messages  

---

## 💡 Tips

1. **Test with 2-minute timeout first** (easier to test)
2. **Check browser console** for debugging info
3. **Activity is automatically tracked** - no manual intervention needed
4. **All protected pages** already have session monitoring
5. **Documentation is comprehensive** - read it for advanced features

---

## 🎉 You're All Set!

Your authentication system now:
- ✅ Logs out after 30 minutes of inactivity
- ✅ Clears JWT and cookies automatically
- ✅ Requires re-login after browser close
- ✅ Provides clear user feedback

**No more 14-day persistent sessions!** 🔒

---

## 📞 Need Help?

Read the detailed documentation:
- `SESSION_MANAGEMENT_DOCUMENTATION.md` (Arabic)
- `SESSION_MANAGEMENT_EN.md` (English)
- `SESSION_FLOW_DIAGRAM.md` (Visual diagrams)

---

**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready
