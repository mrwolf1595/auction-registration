# Testing Firestore Integration

## Prerequisites

1. **Firebase Project Setup**
   - Ensure Firebase project `chalet-booking-75258` is active
   - Firestore Database is enabled
   - Environment variables are configured in `.env.local`

2. **Development Server**
   - Run `npm run dev`
   - Navigate to `http://localhost:3000/register`

## Test Scenarios

### 1. Basic Form Submission Test

**Steps:**
1. Fill out the registration form with the following data:
   ```
   اسم المزايد: أحمد محمد العتيبي
   رقم الهوية: 1234567890
   رقم الجوال: 0501234567
   عدد الشيكات: 2
   رقم الشيك 1: CHK001
   مبلغ الشيك 1: 50000
   رقم الشيك 2: CHK002
   مبلغ الشيك 2: 30000
   البنك المصدر: البنك الأهلي السعودي
   اسم الموظف: أحمد
   ```

2. Add a signature or typed name
3. Click "معاينة" (Preview)
4. Click "حفظ في Firestore" (Save to Firestore)

**Expected Result:**
- Success alert with registration number and document ID
- Green status section appears in preview modal
- Document saved in Firestore collection `مزادات_registrations`

### 2. Firebase Console Verification

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `chalet-booking-75258`
3. Navigate to Firestore Database → Data
4. Look for collection: `مزادات_registrations`
5. Verify the document structure matches the sample

**Expected Document Structure:**
```json
{
  "name": "أحمد محمد العتيبي",
  "idNumber": "1234567890",
  "phone": "0501234567",
  "chequeCount": "2",
  "cheques": [
    {"number": "CHK001", "amount": "50000"},
    {"number": "CHK002", "amount": "30000"}
  ],
  "bank": "البنك الأهلي السعودي",
  "employeeReceiver": "أحمد",
  "signatureData": "data:image/png;base64...",
  "registrationNumber": 42,
  "createdAt": "2024-01-15T10:30:00Z",
  "pdfUrls": {},
  "totalAmount": 80000
}
```

### 3. Multiple Submissions Test

**Steps:**
1. Submit 3-5 different registration forms
2. Verify each gets a unique registration number (1-200)
3. Check that all documents appear in Firestore
4. Verify no duplicate registration numbers

**Expected Result:**
- Each submission gets a unique registration number
- All documents saved successfully
- No collisions in registration numbers

### 4. Error Handling Test

**Steps:**
1. Disconnect internet connection
2. Try to save a form to Firestore
3. Reconnect internet
4. Try saving again

**Expected Result:**
- Error message displayed when offline
- Success when connection restored
- Proper error handling and user feedback

### 5. Data Validation Test

**Steps:**
1. Try submitting form with missing required fields
2. Try submitting with invalid data formats
3. Verify validation works before Firestore save

**Expected Result:**
- Form validation prevents invalid submissions
- Only valid data reaches Firestore
- Proper error messages displayed

## Console Monitoring

### Browser Console
Monitor these logs during testing:
```
✅ Registration saved to Firestore: [document-id]
❌ Error saving to Firestore: [error-message]
```

### Firebase Console
1. Go to Firebase Console → Firestore → Usage
2. Monitor read/write operations
3. Check for any quota issues

## Performance Testing

### Load Test
1. Submit 10 forms rapidly
2. Monitor response times
3. Check Firestore performance

**Expected Result:**
- All submissions successful
- Response times under 2 seconds
- No performance degradation

## Security Testing

### Rules Validation
1. Check Firestore security rules are active
2. Verify only authenticated requests (if implemented)
3. Test with invalid permissions

**Expected Result:**
- Security rules properly enforced
- Unauthorized access blocked
- Proper error messages

## Troubleshooting

### Common Issues

1. **"Firestore is not initialized"**
   - Check `.env.local` file exists
   - Verify Firebase configuration
   - Restart development server

2. **"Permission denied"**
   - Check Firestore security rules
   - Verify project permissions
   - Check Firebase project status

3. **"Document not found"**
   - Check collection name spelling
   - Verify document ID format
   - Check Firestore indexes

4. **"Registration number collision"**
   - Clear browser storage
   - Restart development server
   - Check registration number generation logic

### Debug Mode
Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'firestore:*');
```

## Test Data

### Sample Test Cases

**Case 1: Complete Form**
```json
{
  "bidderName": "سارة أحمد القحطاني",
  "idNumber": "9876543210",
  "phoneNumber": "0559876543",
  "checkCount": "1",
  "cheques": [{"number": "CHK003", "amount": "75000"}],
  "issuingBank": "مصرف الراجحي",
  "employeeName": "محمد",
  "signature": "data:image/png;base64...",
  "typedName": ""
}
```

**Case 2: Typed Name Only**
```json
{
  "bidderName": "عبدالله سالم المطيري",
  "idNumber": "1122334455",
  "phoneNumber": "0501122334",
  "checkCount": "3",
  "cheques": [
    {"number": "CHK004", "amount": "25000"},
    {"number": "CHK005", "amount": "35000"},
    {"number": "CHK006", "amount": "40000"}
  ],
  "issuingBank": "البنك السعودي للاستثمار",
  "employeeName": "فهد",
  "signature": "",
  "typedName": "عبدالله سالم المطيري"
}
```

## Success Criteria

✅ **All tests pass when:**
- Forms submit successfully to Firestore
- Documents appear in Firebase Console
- Registration numbers are unique
- Error handling works properly
- Performance is acceptable
- Security rules are enforced

## Next Steps

After successful testing:
1. Implement production security rules
2. Set up monitoring and alerts
3. Create backup strategies
4. Implement data export features
5. Add admin dashboard for viewing registrations

Your Firestore integration is ready for production! 🎉
