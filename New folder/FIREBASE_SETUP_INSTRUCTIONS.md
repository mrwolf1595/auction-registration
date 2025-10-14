# تعليمات إعداد Firebase

## المشكلة التي تم حلها:
كانت المشكلة أن Firebase لم يتم تهيئته بشكل صحيح، مما أدى إلى خطأ `Cannot read properties of null (reading 'onAuthStateChanged')`.

## الحل المطبق:

### 1. إضافة Realtime Database:
- تم إضافة `getDatabase` من Firebase
- تم إضافة `databaseURL` في إعدادات Firebase
- تم ربط قاعدة البيانات: `https://mazaad-66969-default-rtdb.firebaseio.com/`

### 2. إصلاح مشكلة null checks:
- تم إضافة فحوصات `null` في جميع دوال Firebase
- تم إضافة رسائل خطأ واضحة باللغة العربية
- تم إضافة fallback values في إعدادات Firebase

### 3. إعدادات Firebase المحدثة:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCdo5EhKdwoiw7cyjzIDnMXEVvzgNDFVdY",
  authDomain: "chalet-booking-75258.firebaseapp.com",
  projectId: "chalet-booking-75258",
  storageBucket: "chalet-booking-75258.appspot.com",
  messagingSenderId: "644187367457",
  appId: "1:644187367457:web:xxxxx",
  measurementId: "G-XXXXXXXXXX",
  databaseURL: "https://mazaad-66969-default-rtdb.firebaseio.com/"
};
```

## كيفية الاستخدام:

### 1. تسجيل دخول الموظفين:
- **الموظف الأول:** `nassermess33@gmail.com`
- **الموظف الثاني:** `mrv2194@gmail.com`
- **كلمة المرور:** كلمة المرور المسجلة في Firebase

### 2. قاعدة البيانات:
- **الرابط:** https://mazaad-66969-default-rtdb.firebaseio.com/
- **الهيكل:**
  ```json
  {
    "registrations": {
      "registrationId": {
        "bidderName": "اسم العميل",
        "idNumber": "رقم الهوية",
        "phoneNumber": "رقم الجوال",
        "checkCount": "عدد الشيكات",
        "issuingBank": "البنك المصدر",
        "cheques": [...],
        "status": "pending|completed",
        "completedBy": "اسم الموظف",
        "completedAt": "تاريخ الإكمال",
        "registrationDate": "تاريخ التسجيل"
      }
    }
  }
  ```

## الملفات المحدثة:
- `src/lib/firebase.ts` - إعدادات Firebase مع Realtime Database
- `src/lib/auth.ts` - إصلاح مشكلة null checks
- `src/lib/database.ts` - دوال قاعدة البيانات مع null checks

## النتيجة:
النظام الآن يعمل بشكل صحيح مع Firebase Authentication و Realtime Database!
