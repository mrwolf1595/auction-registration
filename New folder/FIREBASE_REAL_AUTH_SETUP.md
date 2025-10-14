# إعداد Firebase Authentication الحقيقي

## ✅ تم التحديث:
النظام الآن يستخدم Firebase Authentication الحقيقي مع المستخدمين المسجلين في Firebase.

## 🔐 بيانات تسجيل الدخول:
- **الموظف الأول:** `nassermess33@gmail.com`
- **الموظف الثاني:** `mrv2194@gmail.com`
- **كلمة المرور:** كلمة المرور المسجلة في Firebase

## 🛠️ إعدادات Firebase المطلوبة:

### 1. تأكد من إعدادات المشروع:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCdo5EhKdwoiw7cyjzIDnMXEVvzgNDFVdY",
  authDomain: "mazaad-66969.firebaseapp.com",
  projectId: "mazaad-66969",
  storageBucket: "mazaad-66969.appspot.com",
  messagingSenderId: "644187367457",
  appId: "1:644187367457:web:xxxxx",
  measurementId: "G-XXXXXXXXXX",
  databaseURL: "https://mazaad-66969-default-rtdb.firebaseio.com/"
};
```

### 2. تأكد من تفعيل Authentication:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `mazaad-66969`
3. اذهب إلى **Authentication** > **Sign-in method**
4. تأكد من تفعيل **Email/Password**

### 3. تأكد من وجود المستخدمين:
1. في Firebase Console، اذهب إلى **Authentication** > **Users**
2. تأكد من وجود المستخدمين:
   - `nassermess33@gmail.com`
   - `mrv2194@gmail.com`

## 🔄 الملفات المحدثة:
- ✅ `src/lib/auth.ts` - Firebase Authentication الحقيقي
- ✅ `src/app/employee/login/page.tsx` - استخدام Firebase Auth
- ✅ `src/app/employee/dashboard/page.tsx` - استخدام Firebase Auth
- ✅ `src/app/employee/registration/[id]/page.tsx` - استخدام Firebase Auth
- ❌ `src/lib/tempAuth.ts` - تم حذفه (لم يعد مطلوباً)

## 🎯 النظام الحالي:
- ✅ **Firebase Authentication** - تسجيل دخول حقيقي
- ✅ **Realtime Database** - حفظ بيانات العملاء
- ✅ **طباعة الإيصالات** - مع اسم الموظف
- ✅ **تتبع التسجيلات** - في الوقت الفعلي

## 🚨 ملاحظة أمنية:
**لا تضع كلمات المرور في الكود!** النظام الآن آمن ويستخدم Firebase Authentication الحقيقي.

## 📱 كيفية الاستخدام:
1. اذهب إلى `/employee/login`
2. أدخل الإيميل وكلمة المرور المسجلة في Firebase
3. ستحصل على وصول كامل لجميع الميزات

**النظام الآن آمن ومتصل بـ Firebase Authentication الحقيقي!** 🔒
