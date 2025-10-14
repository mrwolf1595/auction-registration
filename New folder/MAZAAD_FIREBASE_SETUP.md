# إعداد Firebase لمشروع المزاد

## 📋 بيانات المشروع:
- **اسم المشروع:** Mazaad
- **Project ID:** mazaad-66969
- **Project Number:** 474870735880
- **Web API Key:** AIzaSyAf9VDoyjobrWOzOfl-7_-NAWT3147HLew

## 🔧 الإعدادات المطبقة:
تم تحديث `src/lib/firebase.ts` بالإعدادات الصحيحة لمشروعك.

## 📁 إنشاء ملف .env.local (اختياري):
إذا كنت تريد استخدام متغيرات البيئة، أنشئ ملف `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAf9VDoyjobrWOzOfl-7_-NAWT3147HLew
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mazaad-66969.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mazaad-66969
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mazaad-66969.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=474870735880
NEXT_PUBLIC_FIREBASE_APP_ID=1:474870735880:web:xxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://mazaad-66969-default-rtdb.firebaseio.com/
```

## 🔐 إعداد Firebase Authentication:

### 1. تفعيل Authentication:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **Mazaad** (mazaad-66969)
3. اذهب إلى **Authentication** > **Get started**
4. اذهب إلى **Sign-in method**
5. فعّل **Email/Password**
6. احفظ التغييرات

### 2. إضافة المستخدمين:
1. اذهب إلى **Authentication** > **Users**
2. انقر على **Add user**
3. أضف الإيميل وكلمة المرور للموظف الأول
4. كرر العملية للموظف الثاني

## 🗄️ إعداد Realtime Database:

### 1. إنشاء قاعدة البيانات:
1. اذهب إلى **Realtime Database**
2. انقر على **Create Database**
3. اختر **Start in test mode** (للاختبار)
4. اختر موقع قاعدة البيانات (مثل: us-central1)

### 2. قاعدة البيانات ستكون متاحة على:
```
https://mazaad-66969-default-rtdb.firebaseio.com/
```

## 🔒 قواعد الأمان (اختياري):
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

## 📱 اختبار النظام:
1. أعد تشغيل الخادم: `npm run dev`
2. اذهب إلى `/employee/login`
3. أدخل الإيميل وكلمة المرور المسجلة في Firebase
4. تأكد من تسجيل الدخول بنجاح

## 🎯 الميزات المتاحة:
- ✅ **Firebase Authentication** - تسجيل دخول آمن
- ✅ **Realtime Database** - حفظ بيانات العملاء
- ✅ **طباعة الإيصالات** - مع اسم الموظف
- ✅ **تتبع التسجيلات** - في الوقت الفعلي

## 🚨 ملاحظات مهمة:
- **تأكد من تفعيل Email/Password Authentication**
- **أضف المستخدمين في Firebase Console**
- **تأكد من إنشاء Realtime Database**
- **النظام يعمل الآن مع مشروع Mazaad الخاص بك**

**النظام جاهز للاستخدام مع مشروع Mazaad!** 🎉
