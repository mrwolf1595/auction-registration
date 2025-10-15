# 🧪 Quick Test Guide - Auction Deadline Feature

## Test the Registration Deadline Feature

### Setup

1. **Start your development server**
   ```powershell
   npm run dev
   ```

2. **Login as employee**
   - Go to http://localhost:3000/employee/login
   - Login with your authorized account

---

## Test Scenarios

### ✅ Test 1: Create Auction for Tomorrow (Should Allow Registration)

1. Go to Employee Dashboard: http://localhost:3000/employee/dashboard
2. Click "إنشاء مزاد جديد"
3. Fill in:
   - Name: `مزاد غداً`
   - Date: **Select tomorrow's date**
   - Description: `اختبار التسجيل قبل يوم المزاد`
4. Click "إنشاء المزاد"
5. Open new tab: http://localhost:3000/register
6. **✅ Expected Result**: 
   - The auction appears in the dropdown
   - You can select it and register
   - Message: Auction name with date

---

### ❌ Test 2: Create Auction for Today (Should Block Registration)

1. Go to Employee Dashboard
2. Click "إنشاء مزاد جديد"
3. Fill in:
   - Name: `مزاد اليوم`
   - Date: **Select today's date** (October 16, 2025)
   - Description: `اختبار إغلاق التسجيل`
4. Click "إنشاء المزاد"
5. Open new tab: http://localhost:3000/register
6. **❌ Expected Result**:
   - Auction does NOT appear in the list
   - Shows message: "لا توجد مزادات متاحة للمشاركة حالياً"
   - Shows note: "يتم إغلاق التسجيل في تمام الساعة 12:00 صباحاً من يوم المزاد"

---

### ❌ Test 3: Create Past Auction (Should Block Registration)

1. Go to Employee Dashboard
2. Click "إنشاء مزاد جديد"
3. Fill in:
   - Name: `مزاد الأمس`
   - Date: **Select yesterday's date** (October 14, 2025)
   - Description: `مزاد منتهي`
4. Click "إنشاء المزاد"
5. Open new tab: http://localhost:3000/register
6. **❌ Expected Result**:
   - Auction does NOT appear
   - Same "not available" message

---

### 🔒 Test 4: Validation on Submit (Extra Security)

If somehow you managed to bypass the filtering:

1. Use browser developer tools (F12)
2. Try to manipulate the form to submit for today's auction
3. **❌ Expected Result**:
   - Alert appears: "عذراً، لا يمكن التسجيل في يوم المزاد أو بعده"
   - Registration is blocked

---

## Quick Commands

### Change Computer Date (For Testing)

**Windows PowerShell (Run as Administrator):**
```powershell
# Set date to tomorrow to test
Set-Date -Date "2025-10-17"

# Set back to today
Set-Date -Date "2025-10-16"
```

⚠️ **Warning**: This will change your system time. Make sure to set it back!

---

## Expected Behavior Summary

| Auction Date vs Today | Visible in Register Page? | Can Submit Registration? |
|----------------------|---------------------------|--------------------------|
| Tomorrow (Oct 17) | ✅ Yes | ✅ Yes |
| 2 days later (Oct 18) | ✅ Yes | ✅ Yes |
| Today (Oct 16) | ❌ No | ❌ No |
| Yesterday (Oct 15) | ❌ No | ❌ No |

---

## What Employee Can Still Do

Even on auction day, employees can:
- ✅ View all auctions in dashboard
- ✅ See all registrations
- ✅ Download receipts
- ✅ Manage registrations
- ✅ Create new auctions

**Only public registration page is affected by the deadline!**

---

## Verification Checklist

- [ ] Created auction for tomorrow → appears on registration page ✅
- [ ] Created auction for today → does NOT appear ❌
- [ ] Registration page shows clear message about deadline
- [ ] Validation alert appears if trying to bypass
- [ ] Employee dashboard still shows all auctions
- [ ] Existing registrations (before deadline) are still visible

---

## Console Messages

Check browser console (F12 → Console) for debugging:

```javascript
// You should see:
"Available auctions: [...]" // Array should not include today's auctions
"Loading auctions..." // When page loads
```

---

## If Something Doesn't Work

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Check auction status**: Must be `'active'`
3. **Verify date format**: Should be `YYYY-MM-DD`
4. **Check console errors**: F12 → Console tab
5. **Restart dev server**: Stop and run `npm run dev` again

---

## Next Steps After Testing

1. ✅ Confirm all tests pass
2. 📝 Update documentation if needed
3. 🚀 Deploy to production
4. 📧 Notify users about the registration deadline policy
5. 📊 Monitor for any issues

---

**Need Help?**
- Check `AUCTION_DEADLINE_FEATURE.md` for detailed documentation
- Review code changes in `src/app/register/page.tsx`
- Open GitHub issue if you encounter problems
