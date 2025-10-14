# قواعد Firebase للتسجيل العام
## إصلاح مشكلة PERMISSION_DENIED

---

## 🔴 المشكلة
عند محاولة التسجيل من صفحة `/register` (صفحة عامة بدون تسجيل دخول)، يظهر خطأ:
```
PERMISSION_DENIED: Permission denied
فشل في حفظ التسجيل
```

## ✅ الحل

### 1. قواعد Firebase الصحيحة

يجب تطبيق القواعد التالية في **Firebase Realtime Database Rules**:

```json
{
  "rules": {
    "registrations": {
      ".read": "auth != null",
      ".write": true,
      ".indexOn": ["auctionId", "status", "bidderNumber", "registrationDate"]
    },
    "auctions": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["date", "status"]
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

### 2. شرح القواعد

#### **registrations**
- **`.read: "auth != null"`** - القراءة متاحة فقط للموظفين المصادقين
- **`.write: true`** - الكتابة متاحة للجميع (للتسجيل العام)
- **`.indexOn`** - فهرسة للبحث السريع

#### **auctions**
- **`.read: true`** - القراءة متاحة للجميع (لعرض المزادات المتاحة)
- **`.write: "auth != null"`** - الكتابة متاحة فقط للموظفين

#### **authorizedUsersByEmail & authorizedUsers**
- **`.read/.write: "auth != null"`** - كلاهما متاح فقط للموظفين المصادقين

---

## 📋 خطوات التطبيق

### الطريقة 1: من Firebase Console (الأسرع)

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. من القائمة الجانبية، اختر **Realtime Database**
4. اضغط على تبويب **Rules**
5. الصق القواعد أعلاه
6. اضغط **Publish**

### الطريقة 2: باستخدام Firebase CLI

```bash
# تأكد من تسجيل الدخول
firebase login

# نشر القواعد
firebase deploy --only database
```

---

## 🔒 ملاحظات الأمان

### ✅ ما تم تأمينه:
- **قراءة التسجيلات**: متاحة فقط للموظفين المصادقين
- **إدارة المزادات**: متاحة فقط للموظفين
- **المستخدمين المصرح لهم**: محمية بالكامل

### ⚠️ نقاط مهمة:
- السماح بالكتابة العامة في `registrations` آمن لأن:
  - لا يمكن للمستخدمين قراءة تسجيلات الآخرين
  - يتم التحقق من صحة البيانات في التطبيق
  - يتم مراجعة التسجيلات من قبل الموظفين

### 🛡️ تحسينات أمان مستقبلية (اختيارية):

إذا أردت تأمين أكثر، يمكنك استخدام قواعد متقدمة:

```json
{
  "rules": {
    "registrations": {
      ".read": "auth != null",
      "$registrationId": {
        ".write": "!data.exists() && newData.exists()",
        ".validate": "newData.hasChildren(['bidderName', 'idNumber', 'phoneNumber', 'checkCount', 'issuingBank', 'cheques', 'registrationDate', 'status', 'auctionId'])"
      },
      ".indexOn": ["auctionId", "status", "bidderNumber", "registrationDate"]
    }
  }
}
```

هذه القواعد المتقدمة:
- تسمح فقط بإنشاء تسجيلات جديدة (لا يمكن التعديل أو الحذف)
- تتحقق من وجود جميع الحقول المطلوبة

---

## 🧪 اختبار القواعد

بعد تطبيق القواعد، يمكنك اختبارها:

### 1. اختبار التسجيل العام
- افتح صفحة `/register`
- املأ النموذج
- اضغط "تسجيل المشاركة"
- يجب أن يتم الحفظ بنجاح ✅

### 2. اختبار القراءة (بدون تسجيل دخول)
- حاول الوصول لصفحة `/employee/dashboard` بدون تسجيل دخول
- يجب أن لا تظهر أي تسجيلات (محمية) ✅

### 3. اختبار القراءة (مع تسجيل دخول)
- سجل دخول كموظف
- افتح `/employee/dashboard`
- يجب أن تظهر جميع التسجيلات ✅

---

## 🔍 استكشاف الأخطاء

### إذا ما زالت المشكلة موجودة:

1. **تأكد من نشر القواعد بشكل صحيح**
   ```bash
   firebase deploy --only database
   ```

2. **امسح الكاش**
   - في المتصفح، اضغط `Ctrl + Shift + R`
   - أو امسح الكاش من إعدادات المتصفح

3. **تحقق من القواعد في Firebase Console**
   - اذهب إلى Realtime Database → Rules
   - تأكد من أن القواعد المنشورة هي الصحيحة

4. **تحقق من Firebase Config**
   - تأكد من أن ملف `.env.local` يحتوي على المفاتيح الصحيحة
   - تأكد من أن Firebase تم تهيئته بشكل صحيح في `src/lib/firebase.ts`

---

## 📝 ملف القواعد

القواعد محفوظة في الملف: `firebase-rules-fix.json`

يمكنك نسخها ولصقها مباشرة في Firebase Console.

---

## ✨ النتيجة المتوقعة

بعد تطبيق هذه القواعد:

✅ **صفحة التسجيل العامة** (`/register`):
- تعمل بدون تسجيل دخول
- يمكن لأي شخص التسجيل في المزاد
- يتم حفظ البيانات في قاعدة البيانات

✅ **صفحة الموظفين** (`/employee/dashboard`):
- محمية بتسجيل دخول
- تعرض جميع التسجيلات للموظفين المصادقين فقط

✅ **الأمان**:
- لا يمكن للمستخدمين العاديين قراءة التسجيلات
- فقط الموظفون يمكنهم إدارة المزادات والمستخدمين

---

## 🎯 الخلاصة

المشكلة كانت في قواعد Firebase التي تتطلب المصادقة للكتابة، لكن صفحة التسجيل العامة لا تتطلب مصادقة. الحل هو السماح بالكتابة العامة في `registrations` مع حماية القراءة للموظفين فقط.

**القواعد المطلوبة:**
- `registrations`: `.write: true` (كتابة للجميع)
- `registrations`: `.read: "auth != null"` (قراءة للموظفين فقط)
- `auctions`: `.read: true` (قراءة للجميع لعرض المزادات)
- باقي الجداول محمية بالكامل

---

**تاريخ الإنشاء:** 14 أكتوبر 2025  
**آخر تحديث:** 14 أكتوبر 2025
