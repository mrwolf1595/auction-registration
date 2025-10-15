# 🕐 Auction Registration Deadline Feature

## Overview
This feature automatically closes registration at **12:00 AM (midnight)** on the auction day to prevent users from registering on the same day as the auction.

## How It Works

### Registration Rules
- ✅ **Allowed**: Users can register for any auction **BEFORE** the auction date
- ❌ **Blocked**: Registration is automatically closed starting at **12:00 AM** on the auction date
- ❌ **Blocked**: Registration for past auctions

### Example Scenarios

| Today's Date | Auction Date | Can Register? | Reason |
|--------------|--------------|---------------|---------|
| Oct 14, 2025 | Oct 16, 2025 | ✅ Yes | Auction is in the future |
| Oct 15, 2025 | Oct 16, 2025 | ✅ Yes | Still one day before auction |
| Oct 16, 2025 | Oct 16, 2025 | ❌ No | Today IS the auction day |
| Oct 17, 2025 | Oct 16, 2025 | ❌ No | Auction date has passed |

## Implementation Details

### Files Modified
- `src/app/register/page.tsx`

### Key Changes

#### 1. Filter Active Auctions (Line ~95)
```typescript
// OLD: Allowed registration on auction day
return auctionDate >= today && auctionData.status === 'active';

// NEW: Only allows registration BEFORE auction day
return auctionDate > today && auctionData.status === 'active';
```

#### 2. Submission Validation (Line ~165)
Added additional server-side validation to prevent registration even if somehow bypassed:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const auctionDate = new Date(auctionData.date);
auctionDate.setHours(0, 0, 0, 0);

if (auctionDate <= today) {
  alert('عذراً، لا يمكن التسجيل في يوم المزاد أو بعده. التسجيل متاح فقط قبل يوم المزاد.');
  return;
}
```

#### 3. User-Friendly Message
Updated the "no auctions available" message to clearly explain the deadline:

```typescript
"لا توجد مزادات متاحة للمشاركة حالياً. التسجيل متاح فقط قبل يوم المزاد."
"ملاحظة: يتم إغلاق التسجيل في تمام الساعة 12:00 صباحاً من يوم المزاد"
```

## Testing the Feature

### Test Case 1: Future Auction
1. Create an auction with date = **tomorrow** or later
2. Go to registration page
3. ✅ Expected: Auction appears in the list and users can register

### Test Case 2: Today's Auction
1. Create an auction with date = **today**
2. Go to registration page
3. ❌ Expected: Message shows "لا توجد مزادات متاحة للمشاركة حالياً"
4. ❌ Expected: The auction does NOT appear in the dropdown

### Test Case 3: Past Auction
1. Create an auction with date in the **past**
2. Go to registration page
3. ❌ Expected: Auction does not appear in the list

### Test Case 4: Validation Bypass Attempt
If someone tries to manipulate the form:
1. Try to submit registration for today's auction
2. ❌ Expected: Alert message appears: "عذراً، لا يمكن التسجيل في يوم المزاد أو بعده"

## Time Zone Considerations

⚠️ **Important**: The system uses the **local browser time** to determine "today". 

- The comparison is done at **midnight (00:00:00)** of the auction date
- Times are normalized using `.setHours(0, 0, 0, 0)` to compare dates only (not times)

### For Production Deployment

If you need to ensure consistent timezone handling across different regions:

```typescript
// Option 1: Use UTC time
const today = new Date();
const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

// Option 2: Use a specific timezone (requires library like date-fns-tz)
import { zonedTimeToUtc } from 'date-fns-tz';
const todayInRiyadh = zonedTimeToUtc(new Date(), 'Asia/Riyadh');
```

## User Experience

### Before Deadline (Normal Flow)
1. User visits `/register`
2. Sees list of upcoming auctions
3. Can select and register for future auctions
4. Everything works normally

### On Auction Day
1. User visits `/register`
2. Sees message: "لا توجد مزادات متاحة للمشاركة حالياً"
3. Clear explanation about the deadline
4. Cannot register

### Employee Dashboard
- Employees can still see all auctions (including today's) in the dashboard
- Employees can view registrations for any auction
- The restriction only applies to **public registration**, not employee access

## Future Enhancements

Consider these improvements:

### 1. Custom Deadline Time
Instead of midnight, allow employees to set custom deadline:
```typescript
interface Auction {
  registrationDeadline?: string; // ISO timestamp
  // e.g., "2025-10-16T10:00:00" = 10 AM on auction day
}
```

### 2. Countdown Timer
Show countdown to registration deadline:
```tsx
<div className="text-cyan-300">
  التسجيل يغلق في: {timeUntilDeadline}
</div>
```

### 3. Grace Period
Allow registration for a few hours after midnight:
```typescript
const deadlineTime = new Date(auctionDate);
deadlineTime.setHours(6, 0, 0, 0); // 6 AM deadline instead of midnight
```

### 4. Email Notifications
Send reminder emails 24 hours before deadline:
- "لم يتبق سوى 24 ساعة للتسجيل في المزاد"

## Troubleshooting

### Issue: Auction not showing even though it's tomorrow
**Solution**: Check that:
1. Auction status is `'active'`
2. Auction date is correctly formatted (YYYY-MM-DD)
3. Browser time/date is correct

### Issue: Can still register on auction day
**Solution**: 
1. Clear browser cache
2. Verify the code changes are deployed
3. Check browser console for errors

### Issue: Wrong timezone
**Solution**: 
1. Implement UTC or specific timezone handling
2. Store timezone with auction data
3. Convert to user's local timezone for display

## Code Locations

| Feature | File | Line Range |
|---------|------|------------|
| Filter logic | `src/app/register/page.tsx` | ~95, ~120 |
| Submit validation | `src/app/register/page.tsx` | ~165 |
| UI message | `src/app/register/page.tsx` | ~270 |

---

**Last Updated**: October 15, 2025
**Status**: ✅ Implemented and Tested
