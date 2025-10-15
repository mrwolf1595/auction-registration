# 🔐 نظام إدارة الجلسات المحسن - Session Management System

## نظرة عامة (Overview)

تم تطبيق نظام شامل لإدارة الجلسات يوفر:
- ✅ انتهاء الجلسة التلقائي بعد 30 دقيقة من عدم النشاط
- ✅ تتبع نشاط المستخدم (حركة الماوس، الكتابة، النقر، إلخ)
- ✅ تسجيل خروج تلقائي عند انتهاء الجلسة
- ✅ تنبيه اختياري قبل انتهاء الجلسة بدقيقتين
- ✅ إعدادات Firebase لضمان عدم بقاء الجلسة بعد إغلاق المتصفح
- ✅ مسح ملفات تعريف الارتباط (cookies) و JWT تلقائياً

---

## 🏗️ البنية التقنية (Technical Architecture)

### 1. **مدير الجلسات (Session Manager)** - `src/lib/sessionManager.ts`

يوفر هذا الملف فئة `SessionManager` التي تراقب نشاط المستخدم وتدير انتهاء الجلسة.

#### الميزات الرئيسية:
- **تتبع النشاط**: يراقب أحداث الماوس، لوحة المفاتيح، والتمرير
- **مؤقت عدم النشاط**: 30 دقيقة (قابل للتخصيص)
- **فحص دوري**: يفحص حالة الجلسة كل دقيقة
- **تخزين محلي**: يحفظ وقت آخر نشاط في localStorage
- **تنظيف تلقائي**: يزيل المستمعين والمؤقتات عند إيقاف المراقبة

#### الأحداث المراقبة:
```javascript
const ACTIVITY_EVENTS = [
  'mousedown',   // نقر الماوس
  'mousemove',   // حركة الماوس
  'keypress',    // ضغط المفاتيح
  'scroll',      // التمرير
  'touchstart',  // اللمس (للأجهزة اللوحية)
  'click',       // النقر
  'keydown',     // الضغط على المفتاح
];
```

#### الإعدادات الافتراضية:
```javascript
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة
const WARNING_TIME = 2 * 60 * 1000;         // تنبيه قبل دقيقتين
const CHECK_INTERVAL = 60 * 1000;            // فحص كل دقيقة
```

---

### 2. **إعدادات Firebase** - `src/lib/firebase.ts`

تم تكوين Firebase Auth لاستخدام `browserSessionPersistence`:

```typescript
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

// تكوين استمرار الجلسة للمتصفح فقط
setPersistence(auth, browserSessionPersistence)
```

#### ما يعنيه هذا:
- ✅ الجلسة تبقى فقط خلال جلسة المتصفح الحالية
- ✅ يتم مسح المصادقة تلقائياً عند إغلاق المتصفح/التبويب
- ✅ لن يبقى المستخدم مسجلاً الدخول لمدة 14 يوماً
- ✅ لا يتم تخزين JWT في localStorage بشكل دائم

---

### 3. **خطاف React** - `src/hooks/useSessionManager.ts`

يوفر واجهة سهلة لدمج إدارة الجلسات في مكونات React.

#### استخدام أساسي:
```typescript
const sessionStatus = useSessionManager(isAuthenticated, {
  showWarning: true,          // إظهار تنبيه قبل الانتهاء
  onWarning: () => {
    // معالج مخصص للتنبيه
    console.warn('Session expiring soon!');
  },
  onLogout: () => {
    // معالج مخصص قبل تسجيل الخروج
    console.log('Logging out...');
  },
  redirectPath: '/employee/login',
  enabled: true,              // تمكين/تعطيل النظام
});
```

#### الخصائص المتاحة:
```typescript
interface SessionStatus {
  isActive: boolean;           // هل المراقبة نشطة
  remainingMinutes: number;    // الوقت المتبقي بالدقائق
  showingWarning: boolean;     // هل يتم عرض تنبيه
  resetTimer: () => void;      // إعادة تعيين المؤقت يدوياً
}
```

---

### 4. **تحديثات المصادقة** - `src/lib/auth.ts`

تم دمج مدير الجلسات مع وظائف المصادقة:

```typescript
// عند تسجيل الخروج
export const signOutEmployee = async (): Promise<void> => {
  // إيقاف مراقبة الجلسة
  sessionManager.stopMonitoring();
  
  // تسجيل الخروج من Firebase
  await signOut(auth);
};
```

---

## 📝 دليل الاستخدام (Usage Guide)

### في صفحة لوحة التحكم (Dashboard):

```typescript
import { useSessionManager } from '@/hooks/useSessionManager';

export default function DashboardPage() {
  const [employee, setEmployee] = useState<EmployeeUser | null>(null);
  
  // تفعيل إدارة الجلسات
  const sessionStatus = useSessionManager(!!employee, {
    showWarning: true,
    onWarning: () => {
      // إظهار إشعار للمستخدم
      toast.warning('الجلسة ستنتهي خلال دقيقتين!');
    },
    onLogout: () => {
      // تنظيف البيانات المحلية
      localStorage.clear();
    },
    redirectPath: '/employee/login',
  });

  return (
    <div>
      {/* عرض حالة الجلسة */}
      {sessionStatus.isActive && (
        <div>
          <p>الجلسة نشطة</p>
          <p>الوقت المتبقي: {sessionStatus.remainingMinutes} دقيقة</p>
        </div>
      )}
    </div>
  );
}
```

### في صفحة تسجيل الدخول (Login):

تم إضافة معالجة رسالة انتهاء المهلة:

```typescript
const searchParams = useSearchParams();

useEffect(() => {
  // التحقق من تسجيل الخروج بسبب انتهاء المهلة
  const timeout = searchParams.get('timeout');
  if (timeout === 'true') {
    setTimeoutMessage('تم تسجيل الخروج تلقائياً بسبب عدم النشاط لمدة 30 دقيقة');
  }
}, [searchParams]);
```

---

## 🎯 سير العمل (Workflow)

### 1. تسجيل الدخول:
```
المستخدم → تسجيل الدخول → Firebase Auth → تعيين الجلسة
                                    ↓
                          بدء مراقبة الجلسة (30 دقيقة)
```

### 2. النشاط:
```
نشاط المستخدم → تحديث وقت آخر نشاط → حفظ في localStorage
                                    ↓
                             إعادة تعيين المؤقت (30 دقيقة)
```

### 3. عدم النشاط:
```
28 دقيقة عدم نشاط → تنبيه اختياري (دقيقتان متبقيتان)
         ↓
30 دقيقة عدم نشاط → تسجيل خروج تلقائي
         ↓
إعادة التوجيه إلى صفحة تسجيل الدخول (مع رسالة timeout)
```

### 4. إغلاق المتصفح:
```
إغلاق المتصفح/التبويب → Firebase يمسح الجلسة تلقائياً
                          ↓
                   لا يوجد JWT محفوظ
                          ↓
               يجب تسجيل الدخول مرة أخرى
```

---

## 🔧 التخصيص (Customization)

### تغيير مدة انتهاء المهلة:

في `src/lib/sessionManager.ts`:
```typescript
// تغيير من 30 دقيقة إلى 15 دقيقة
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
```

### تعطيل التنبيه:

```typescript
useSessionManager(isAuthenticated, {
  showWarning: false,  // لا تنبيه
});
```

### تخصيص مسار إعادة التوجيه:

```typescript
useSessionManager(isAuthenticated, {
  redirectPath: '/custom/login',
});
```

### إضافة أحداث مراقبة إضافية:

في `src/lib/sessionManager.ts`:
```typescript
const ACTIVITY_EVENTS = [
  ...existingEvents,
  'wheel',        // عجلة الماوس
  'resize',       // تغيير حجم النافذة
  'focus',        // التركيز على النافذة
];
```

---

## 🧪 الاختبار (Testing)

### اختبار انتهاء الجلسة:

1. **تقليل المدة مؤقتاً**:
```typescript
// للاختبار فقط - 2 دقيقة بدلاً من 30
const INACTIVITY_TIMEOUT = 2 * 60 * 1000;
```

2. **تسجيل الدخول** إلى لوحة التحكم
3. **عدم القيام بأي نشاط** لمدة 2 دقيقة
4. **التحقق** من تسجيل الخروج التلقائي

### اختبار التنبيه:

1. تفعيل `showWarning: true`
2. الانتظار حتى تبقى دقيقتان
3. التحقق من عرض التنبيه

### اختبار إعادة تعيين المؤقت:

1. تسجيل الدخول
2. الانتظار 25 دقيقة
3. تحريك الماوس (نشاط)
4. التحقق من إعادة تعيين المؤقت إلى 30 دقيقة

---

## 📊 مؤشرات الأداء (Performance)

- ✅ **تأثير منخفض على الأداء**: فحص كل دقيقة فقط
- ✅ **مستمعات سلبية**: `{ passive: true }` لعدم حظر التمرير
- ✅ **تنظيف تلقائي**: إزالة المستمعات عند إلغاء تثبيت المكون
- ✅ **استخدام الذاكرة الأمثل**: مثيل واحد فقط (singleton)

---

## 🔒 الأمان (Security)

### ما تم تحقيقه:

✅ **لا جلسات طويلة الأمد**: 30 دقيقة كحد أقصى بدون نشاط
✅ **مسح تلقائي**: JWT و cookies تُمسح تلقائياً
✅ **عدم استمرار الجلسة**: لا تخزين دائم في localStorage
✅ **جلسة المتصفح فقط**: تنتهي عند إغلاق المتصفح
✅ **حماية من اختطاف الجلسة**: انتهاء تلقائي بعد عدم النشاط

### أفضل الممارسات المطبقة:

1. **Principle of Least Privilege**: جلسات قصيرة الأمد
2. **Defense in Depth**: طبقات متعددة من الحماية
3. **Secure by Default**: الإعدادات الآمنة افتراضياً
4. **Zero Trust**: التحقق المستمر من الجلسة

---

## 🚀 الصيانة والتطوير المستقبلي

### إمكانيات التحسين:

1. **إضافة إشعارات**: نظام toast للتنبيهات
2. **تخزين السحابة**: حفظ حالة الجلسة في Firestore
3. **تحليلات**: تتبع أنماط استخدام الجلسات
4. **جلسات متعددة الأجهزة**: مزامنة عبر الأجهزة
5. **تمديد تلقائي**: خيار لتمديد الجلسة تلقائياً عند النشاط

### نقاط المراقبة:

- 📊 متوسط مدة الجلسات
- 📊 معدل انتهاء المهلات
- 📊 أوقات ذروة الاستخدام
- 📊 معدل تسجيل الدخول مرة أخرى

---

## 📚 المراجع والموارد

### وثائق Firebase:
- [Firebase Auth Session Management](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

### معايير الأمان:
- [OWASP Session Management](https://owasp.org/www-community/controls/Session_Management)
- [NIST Authentication Guidelines](https://pages.nist.gov/800-63-3/)

---

## ✅ الخلاصة (Summary)

تم تنفيذ نظام شامل لإدارة الجلسات يوفر:

1. ✅ **انتهاء تلقائي بعد 30 دقيقة من عدم النشاط**
2. ✅ **تتبع نشاط المستخدم بشكل شامل**
3. ✅ **تسجيل خروج تلقائي وإعادة توجيه**
4. ✅ **إعدادات Firebase الآمنة (browserSessionPersistence)**
5. ✅ **عدم بقاء JWT أو cookies بعد إغلاق المتصفح**
6. ✅ **واجهة سهلة الاستخدام مع React Hooks**
7. ✅ **مؤشرات بصرية لحالة الجلسة**
8. ✅ **رسائل واضحة عند انتهاء المهلة**

النظام جاهز للإنتاج ويوفر أماناً محسناً ضد:
- اختطاف الجلسة (Session Hijacking)
- الوصول غير المصرح (Unauthorized Access)
- الجلسات المهجورة (Abandoned Sessions)

---

## 🎉 تهانينا!

لقد تم تطبيق نظام إدارة جلسات آمن وفعال! 🚀

للمزيد من المعلومات أو الدعم، راجع الملفات:
- `src/lib/sessionManager.ts`
- `src/hooks/useSessionManager.ts`
- `src/lib/firebase.ts`
- `src/lib/auth.ts`
