# إصلاح مشكلة تسجيل الدخول في Firebase

## 🚨 المشكلة:
خطأ `auth/invalid-credential` عند محاولة تسجيل دخول الموظفين.

## 🔍 السبب:
تضارب في إعدادات Firebase - الملف `firebase-config.env` يحتوي على إعدادات مشروع مختلف.

## 🔧 الحل:

### 1. إنشاء ملف `.env.local`:
أنشئ ملف جديد باسم `.env.local` في المجلد الجذر للمشروع وأضف المحتوى التالي:

```env
# Firebase Configuration for Mazaad Auction Registration System
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAf9VDoyjobrWOzOfl-7_-NAWT3147HLew
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mazaad-66969.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mazaad-66969
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mazaad-66969.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=474870735880
NEXT_PUBLIC_FIREBASE_APP_ID=1:474870735880:web:xxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://mazaad-66969-default-rtdb.firebaseio.com/
```

### 2. إعداد Firebase Authentication:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **Mazaad** (mazaad-66969)
3. اذهب إلى **Authentication** > **Sign-in method**
4. فعّل **Email/Password**
5. احفظ التغييرات

### 3. إضافة المستخدمين:
1. اذهب إلى **Authentication** > **Users**
2. انقر على **Add user**
3. أضف المستخدمين التاليين:

**المستخدم الأول:**
- Email: `nassermessi33@gmail.com`
- Password: `[كلمة مرور قوية]`

**المستخدم الثاني:**
- Email: `mrv2194@gmail.com`
- Password: `[كلمة مرور قوية]`

### 4. تحديث قواعد الأمان:
تأكد من أن قواعد Firebase Realtime Database تحتوي على:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "registrations": {
      ".read": "auth != null",
      ".write": true
    },
    
    "مزادات_registrations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "auctions": {
      ".read": true,
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

### 5. إعادة تشغيل الخادم:
```bash
npm run dev
```

## ✅ النتيجة المتوقعة:
بعد تطبيق هذه الخطوات:
- ✅ **تسجيل الدخول يعمل بشكل صحيح**
- ✅ **الموظفون يمكنهم الوصول للنظام**
- ✅ **قواعد الأمان تعمل بشكل صحيح**

## 🔍 اختبار النظام:
1. اذهب إلى `/employee/login`
2. استخدم أحد الحسابات المضافة
3. تأكد من الوصول إلى `/employee/dashboard`

## 📞 إذا استمرت المشكلة:
1. تحقق من console في المتصفح للأخطاء
2. تأكد من أن Firebase Authentication مفعل
3. تحقق من أن المستخدمين تم إضافتهم بشكل صحيح
4. تأكد من أن ملف `.env.local` موجود ويحتوي على الإعدادات الصحيحة
