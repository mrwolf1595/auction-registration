# تعليمات إعداد متغيرات البيئة

## 📁 إنشاء ملف .env.local:

أنشئ ملف `.env.local` في المجلد الجذر للمشروع وأضف المحتوى التالي:

```env
# Firebase Configuration for Auction Registration System
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
```

## 🔧 كيفية الحصول على هذه القيم:

### 1. اذهب إلى Firebase Console:
- [Firebase Console](https://console.firebase.google.com/)

### 2. اختر مشروعك:
- اختر المشروع الذي تريد استخدامه

### 3. اذهب إلى Project Settings:
- انقر على ⚙️ (Settings) > **Project settings**

### 4. اذهب إلى General tab:
- انقر على **General** tab

### 5. انقر على Add app:
- انقر على **Add app** > **Web app** (🌐)

### 6. سجل اسم التطبيق:
- أدخل اسم التطبيق (مثل: "auction-registration")

### 7. انسخ إعدادات Firebase:
ستظهر لك شاشة تحتوي على:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### 8. انسخ القيم إلى .env.local:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

## 🔄 إعادة تشغيل الخادم:
بعد إنشاء ملف `.env.local`:
```bash
npm run dev
```

## ✅ التحقق من الإعداد:
1. تأكد من أن ملف `.env.local` موجود في المجلد الجذر
2. تأكد من أن جميع القيم مملوءة
3. أعد تشغيل الخادم
4. جرب تسجيل الدخول

## 🚨 ملاحظات مهمة:
- **لا تشارك ملف .env.local** - يحتوي على معلومات حساسة
- **تأكد من إضافة .env.local إلى .gitignore**
- **استخدم قيم Firebase الخاصة بك فقط**

**بعد إكمال هذه الخطوات، النظام سيعمل مع Firebase الخاص بك!** 🎉
