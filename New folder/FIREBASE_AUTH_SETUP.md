# إعداد Firebase Authentication

## المشكلة الحالية:
Firebase يعطي خطأ `auth/invalid-credential` مما يعني أن المستخدمين غير موجودين في Firebase Authentication.

## الحل المؤقت المطبق:
تم إنشاء نظام تسجيل دخول مؤقت للاختبار في `src/lib/tempAuth.ts` مع البيانات التالية:

### بيانات الموظفين للاختبار:
- **الموظف الأول:** `nassermess33@gmail.com` / `123456`
- **الموظف الثاني:** `mrv2194@gmail.com` / `123456`

## إعداد Firebase Authentication (للمستقبل):

### 1. إنشاء المستخدمين في Firebase Console:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `mazaad-66969`
3. اذهب إلى **Authentication** > **Users**
4. انقر على **Add user**
5. أضف المستخدمين:
   - `nassermess33@gmail.com`
   - `mrv2194@gmail.com`
6. اضبط كلمات المرور لكل مستخدم

### 2. تفعيل Authentication Methods:
1. في Firebase Console، اذهب إلى **Authentication** > **Sign-in method**
2. فعّل **Email/Password**
3. احفظ التغييرات

### 3. تحديث ملف .env.local:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mazaad-66969.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mazaad-66969
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mazaad-66969.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. التبديل إلى Firebase Auth:
بعد إعداد المستخدمين، قم بتغيير الاستيراد في الملفات التالية:
- `src/app/employee/login/page.tsx`
- `src/app/employee/dashboard/page.tsx`
- `src/app/employee/registration/[id]/page.tsx`

من:
```typescript
import { ... } from '@/lib/tempAuth';
```

إلى:
```typescript
import { ... } from '@/lib/auth';
```

## النظام الحالي:
- ✅ يعمل مع النظام المؤقت
- ✅ يحفظ البيانات في Firebase Realtime Database
- ✅ يطبع الإيصالات بشكل صحيح
- ✅ يتتبع حالة التسجيلات

## الملفات المحدثة:
- `src/lib/tempAuth.ts` - نظام تسجيل دخول مؤقت
- `src/app/employee/login/page.tsx` - استخدام النظام المؤقت
- `src/app/employee/dashboard/page.tsx` - استخدام النظام المؤقت
- `src/app/employee/registration/[id]/page.tsx` - استخدام النظام المؤقت

النظام يعمل الآن بشكل كامل مع النظام المؤقت! 🎉
