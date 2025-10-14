# Firestore Setup and Configuration

## Collection Structure

### Collection: `مزادات_registrations`

Each document contains the following fields:

```typescript
interface RegistrationDocument {
  name: string;                    // اسم المزايد
  idNumber: string;               // رقم الهوية
  phone: string;                  // رقم الجوال
  chequeCount: string;            // عدد الشيكات
  cheques: ChequeData[];          // تفاصيل الشيكات
  bank: string;                   // البنك المصدر
  employeeReceiver: string;       // اسم الموظف
  signatureData?: string;         // بيانات التوقيع (Base64)
  typedName?: string;             // الاسم المطبوع
  registrationNumber: number;     // رقم التسجيل الفريد
  createdAt: Timestamp;          // تاريخ الإنشاء
  pdfUrls: {                     // روابط ملفات PDF
    receipt?: string;
    declaration?: string;
  };
  totalAmount: number;           // المبلغ الإجمالي
}
```

## Security Rules

### Firestore Security Rules

Add these rules to your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to auction registrations
    match /مزادات_registrations/{document} {
      // For development - allow all access
      allow read, write: if true;
      
      // For production - implement proper authentication
      // allow read, write: if request.auth != null;
      
      // For production with role-based access
      // allow read, write: if request.auth != null && 
      //   request.auth.token.role in ['admin', 'employee'];
    }
  }
}
```

### Production Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /مزادات_registrations/{document} {
      // Only authenticated users can read/write
      allow read, write: if request.auth != null;
      
      // Validate document structure
      allow create: if request.auth != null &&
        validateRegistrationDocument(request.resource.data);
      
      // Only allow updates to specific fields
      allow update: if request.auth != null &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['pdfUrls', 'signatureData']);
    }
  }
  
  // Helper function to validate document structure
  function validateRegistrationDocument(data) {
    return data.keys().hasAll([
      'name', 'idNumber', 'phone', 'chequeCount', 
      'cheques', 'bank', 'employeeReceiver', 
      'registrationNumber', 'createdAt', 'totalAmount'
    ]) &&
    data.name is string &&
    data.idNumber is string &&
    data.phone is string &&
    data.cheques is list &&
    data.registrationNumber is number &&
    data.totalAmount is number;
  }
}
```

## Indexing Requirements

### Required Indexes

Create these composite indexes in Firebase Console:

1. **For querying by date (most recent first):**
   ```
   Collection: مزادات_registrations
   Fields: createdAt (Descending)
   ```

2. **For querying by registration number:**
   ```
   Collection: مزادات_registrations
   Fields: registrationNumber (Ascending)
   ```

3. **For querying by employee:**
   ```
   Collection: مزادات_registrations
   Fields: employeeReceiver (Ascending), createdAt (Descending)
   ```

4. **For querying by total amount range:**
   ```
   Collection: مزادات_registrations
   Fields: totalAmount (Ascending), createdAt (Descending)
   ```

### Creating Indexes

1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Select collection: `مزادات_registrations`
4. Add fields as specified above
5. Click "Create"

## Sample Document

Here's a sample document that will be saved:

```json
{
  "name": "أحمد محمد العتيبي",
  "idNumber": "1234567890",
  "phone": "0501234567",
  "chequeCount": "2",
  "cheques": [
    {
      "number": "CHK001",
      "amount": "50000"
    },
    {
      "number": "CHK002", 
      "amount": "30000"
    }
  ],
  "bank": "البنك الأهلي السعودي",
  "employeeReceiver": "أحمد",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "registrationNumber": 42,
  "createdAt": "2024-01-15T10:30:00Z",
  "pdfUrls": {
    "receipt": "https://firebasestorage.googleapis.com/...",
    "declaration": "https://firebasestorage.googleapis.com/..."
  },
  "totalAmount": 80000
}
```

## Usage Instructions

### 1. Enable Firestore
1. Go to Firebase Console
2. Select your project: `chalet-booking-75258`
3. Go to Firestore Database
4. Click "Create database"
5. Choose "Start in test mode" for development
6. Select a location (recommend: us-central1)

### 2. Set Security Rules
1. Go to Firestore → Rules
2. Replace the default rules with the rules above
3. Click "Publish"

### 3. Create Indexes
1. Go to Firestore → Indexes
2. Create the indexes listed above
3. Wait for indexes to build (may take a few minutes)

### 4. Test the Integration
1. Run the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/register`
3. Fill out the registration form
4. Click "معاينة" (Preview)
5. Click "حفظ في Firestore" (Save to Firestore)
6. Check Firebase Console → Firestore → Data to see the saved document

## Querying Data

### Get Recent Registrations
```javascript
import { getRecentRegistrations } from '@/lib/firestoreUtils';

const recentRegistrations = await getRecentRegistrations(10);
console.log('Recent registrations:', recentRegistrations);
```

### Custom Queries
```javascript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Query by employee
const employeeQuery = query(
  collection(db, 'مزادات_registrations'),
  where('employeeReceiver', '==', 'أحمد'),
  orderBy('createdAt', 'desc')
);

// Query by amount range
const amountQuery = query(
  collection(db, 'مزادات_registrations'),
  where('totalAmount', '>=', 50000),
  where('totalAmount', '<=', 100000),
  orderBy('totalAmount', 'desc')
);

// Query by registration number
const regNumberQuery = query(
  collection(db, 'مزادات_registrations'),
  where('registrationNumber', '==', 42)
);
```

## Monitoring and Analytics

### Firestore Usage Monitoring
1. Go to Firebase Console → Usage
2. Monitor read/write operations
3. Set up billing alerts if needed

### Performance Monitoring
1. Go to Firebase Console → Performance
2. Monitor query performance
3. Optimize slow queries

## Backup and Export

### Automated Backups
1. Go to Firebase Console → Firestore → Backups
2. Enable automated backups
3. Set backup frequency (daily/weekly)

### Manual Export
```bash
# Export all data
gcloud firestore export gs://your-backup-bucket

# Export specific collection
gcloud firestore export gs://your-backup-bucket --collection-ids=مزادات_registrations
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check security rules
   - Verify authentication
   - Ensure proper field validation

2. **Index Not Found**
   - Create required indexes
   - Wait for index building to complete
   - Check query structure

3. **Document Too Large**
   - Firestore has 1MB document limit
   - Consider splitting large documents
   - Use subcollections for related data

4. **Query Performance**
   - Use appropriate indexes
   - Limit result sets
   - Avoid complex queries

### Debug Mode
Enable Firestore debug logging:
```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Production Considerations

### Security
- Implement proper authentication
- Use role-based access control
- Validate all input data
- Set up monitoring and alerts

### Performance
- Create appropriate indexes
- Use pagination for large datasets
- Implement caching strategies
- Monitor query performance

### Scalability
- Design for horizontal scaling
- Use subcollections for related data
- Implement data archiving
- Consider data partitioning

Your Firestore integration is now ready for production use! 🎉
