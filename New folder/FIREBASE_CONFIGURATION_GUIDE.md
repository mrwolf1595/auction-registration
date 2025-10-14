# دليل إعداد Firebase للمزاد

## 🔧 الإعدادات المطلوبة في Firebase:

### 1. Firebase Authentication:
- ✅ **تفعيل Email/Password Authentication**
- ✅ **إضافة المستخدمين المسجلين**

### 2. Realtime Database:
- ✅ **تفعيل Realtime Database**
- ✅ **إعداد قواعد الأمان**

### 3. إعدادات المشروع:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/"
};
```

## 📋 خطوات الإعداد:

### 1. إنشاء/تحديث المشروع:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد أو استخدم المشروع الموجود
3. سجل اسم المشروع (مثل: `mazaad-66969`)

### 2. إعداد Authentication:
1. في Firebase Console، اذهب إلى **Authentication**
2. انقر على **Get started**
3. اذهب إلى **Sign-in method**
4. فعّل **Email/Password**
5. احفظ التغييرات

### 3. إضافة المستخدمين:
1. اذهب إلى **Authentication** > **Users**
2. انقر على **Add user**
3. أضف الإيميل وكلمة المرور للموظف الأول
4. كرر العملية للموظف الثاني

### 4. إعداد Realtime Database:
1. اذهب إلى **Realtime Database**
2. انقر على **Create Database**
3. اختر **Start in test mode** (للاختبار)
4. اختر موقع قاعدة البيانات (مثل: us-central1)

### 5. إعداد قواعد الأمان (اختياري):
```json
{
  "rules": {
    "registrations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "auctions": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 6. الحصول على إعدادات المشروع:
1. اذهب إلى **Project Settings** (⚙️)
2. انقر على **General** tab
3. انقر على **Add app** > **Web app**
4. سجل اسم التطبيق
5. انسخ إعدادات Firebase

### 7. تحديث ملف .env.local:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🔒 الأمان:
- ✅ **لا تضع كلمات المرور في الكود**
- ✅ **استخدم متغيرات البيئة**
- ✅ **فعّل قواعد الأمان في Firebase**

## 📱 اختبار النظام:
1. اذهب إلى `/employee/login`
2. أدخل الإيميل وكلمة المرور المسجلة في Firebase
3. تأكد من تسجيل الدخول بنجاح
4. اختبر حفظ البيانات في Realtime Database

## 🆘 استكشاف الأخطاء:
- **خطأ Authentication:** تأكد من تفعيل Email/Password
- **خطأ Database:** تأكد من إنشاء Realtime Database
- **خطأ Config:** تأكد من صحة إعدادات Firebase

**بعد إكمال هذه الخطوات، النظام سيعمل بشكل كامل مع Firebase!** 🎉
