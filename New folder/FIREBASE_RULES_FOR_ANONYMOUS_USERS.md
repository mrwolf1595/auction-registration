# تحديث قواعد الأمان في Firebase للسماح بالوصول للزوار

## 📋 القواعد الحالية:
```json
{
  "rules": {
    ".read": "auth != null && now < 1741208400000",
    ".write": "auth != null && now < 1741208400000"
  }
}
```

## 🔧 القواعد المحدثة المطلوبة:
```json
{
  "rules": {
    ".read": "auth != null && now < 1741208400000",
    ".write": "auth != null && now < 1741208400000",
    "registrations": {
      ".read": "auth != null",
      ".write": "(auth != null || auth.token.firebase.sign_in_provider == 'anonymous') && now < 1741208400000"
    },
    "مزادات_registrations": {
      ".read": "auth != null",
      ".write": "(auth != null || auth.token.firebase.sign_in_provider == 'anonymous') && now < 1741208400000"
    },
    "auctions": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "authorizedUsersByEmail": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "authorizedUsers": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📝 الشرح:
- **`auth != null`** = يتطلب تسجيل دخول المستخدم
- **`auth.token.firebase.sign_in_provider == 'anonymous'`** = يسمح بالوصول للزوار المجهولين
- **`now < 1741208400000`** = يسمح بالوصول حتى 6 مارس 2025
- **جدول `registrations` و `مزادات_registrations`** = يسمح للزوار المجهولين بالكتابة
- **جدول `auctions`** = يسمح فقط للموظفين المعتمدين بالكتابة

## 🎯 الخطوات:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **Mazaad** (mazaad-66969)
3. اذهب إلى **Realtime Database**
4. انقر على **Rules** tab
5. استبدل القواعد بالقواعد المحدثة أعلاه
6. انقر على **Publish**

## 🔧 قواعد Firebase Storage:
تأكد أيضاً من تحديث قواعد Firebase Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Block all writes by default
    }
    
    // Allow writes only to specific paths for registrations
    match /registrations/{userId}/{fileName} {
      allow write: if request.auth != null || request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
    
    match /مزادات_registrations/{userId}/{fileName} {
      allow write: if request.auth != null || request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
  }
}
```

## 🔧 قواعد Firestore:
إذا كنت تستخدم Firestore، تأكد من تحديث قواعده أيضاً:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.firebase.sign_in_provider != 'anonymous';
    }
    
    // Specific rules for registration collections
    match /registrations/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null || request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
    
    match /مزادات_registrations/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null || request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
  }
}
```