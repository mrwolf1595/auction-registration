# ✅ تحديث دعم التوقيعين معاً

## المشكلة التي تم حلها

### 🔴 المشكلة السابقة:
كان النظام يدعم **واحد فقط** من الاتنين:
- إما التوقيع الرقمي (من Canvas)
- أو الاسم المطبوع

لما المستخدم يوقع على Canvas، كان الكود يمسح الاسم المطبوع.
لما المستخدم يكتب اسمه، كان الكود يمسح التوقيع الرقمي.

**النتيجة**: واحد بس كان بيتسجل في قاعدة البيانات ويظهر في PDF.

---

## ✅ الحل الجديد

الآن النظام يدعم **الاتنين معاً**:
- التوقيع الرقمي (من Canvas) ✅
- الاسم المطبوع ✅
- أو الاتنين معاً ✅✅

**النتيجة**: الاتنين بيتسجلوا في قاعدة البيانات ويظهروا في PDF.

---

## التحديثات التفصيلية

### 1. `src/app/register/page.tsx`

#### التحقق من الصلاحية (onSubmit):
```typescript
// قبل 🔴:
if (!signature) {
  alert('يرجى التوقيع على النموذج');
  return;
}

// بعد 🟢:
if (!signature && !data.typedName) {
  alert('يرجى التوقيع على النموذج أو إدخال اسمك المطبوع');
  return;
}
```

#### حفظ البيانات:
```typescript
// قبل 🔴:
const registrationData = {
  // ...
  signature,
  typedName: data.typedName || ''
};

// بعد 🟢:
const registrationData = {
  // ...
  signature, // التوقيع الرقمي من Canvas
  typedName: data.typedName || '', // الاسم المطبوع
};

console.log('Signature (Canvas):', signature ? 'موجود' : 'غير موجود');
console.log('Typed Name:', data.typedName || 'غير موجود');
```

#### إلغاء المسح التلقائي:
```typescript
// قبل 🔴:
onSignatureChange={(signatureData: string) => {
  if (signatureData) {
    setSignature(signatureData);
    setIsSignatureValid(true);
    // مسح حقل الاسم المطبوع ❌
    const typedNameInput = document.querySelector('input[name="typedName"]');
    if (typedNameInput) {
      typedNameInput.value = '';
      setValue('typedName', '');
    }
  }
}}

// بعد 🟢:
onSignatureChange={(signatureData: string) => {
  if (signatureData) {
    setSignature(signatureData);
    setIsSignatureValid(true);
    // لا نمسح الاسم المطبوع - نحتفظ بالاتنين ✅
  }
}}
```

#### تحديث الصلاحية:
```typescript
// قبل 🔴:
onChange={(e) => {
  if (e.target.value.trim()) {
    setSignature(e.target.value);
    setIsSignatureValid(true);
  } else {
    // مسح التوقيع الرقمي ❌
    setIsSignatureValid(false);
    setSignature('');
  }
}}

// بعد 🟢:
onChange={(e) => {
  const hasTypedName = Boolean(e.target.value.trim());
  const canvasSignature = signatureRef.current?.getSignature();
  const hasCanvasSignature = Boolean(canvasSignature && canvasSignature !== '...');
  
  // صالح إذا كان في توقيع رقمي أو اسم مطبوع ✅
  setIsSignatureValid(hasTypedName || hasCanvasSignature);
}}
```

---

### 2. `src/lib/robustPdfGenerator.ts`

#### عرض التوقيعين في PDF:

##### للإقرار (Declaration):
```typescript
// قبل 🔴: واحد بس
const signatureHTML = formData.signature ? 
  `<img src="${formData.signature}" />` : 
  `<div>${formData.typedName}</div>`;

// بعد 🟢: الاتنين
let signatureHTML = '';

// إذا كان في توقيع رقمي
if (formData.signature && formData.signature.startsWith('data:image')) {
  signatureHTML += `
    <div>
      <div>التوقيع الرقمي:</div>
      <img src="${formData.signature}" />
    </div>`;
}

// إذا كان في اسم مطبوع
if (formData.typedName && formData.typedName.trim()) {
  signatureHTML += `
    <div>
      <div>الاسم المطبوع:</div>
      <div>${formData.typedName}</div>
    </div>`;
}
```

##### حالة التوقيع:
```typescript
// قبل 🔴:
التوقيع: ${formData.signature ? 'تم التوقيع' : 'لم يتم التوقيع'}

// بعد 🟢:
التوقيع: 
${formData.signature ? '✓ رقمي' : ''}
${formData.signature && formData.typedName ? ' + ' : ''}
${formData.typedName ? '✓ مطبوع' : ''}
```

---

## الأمثلة

### الحالة 1: توقيع رقمي فقط
```
المستخدم: يوقع على Canvas فقط
النتيجة في PDF:
  التوقيع: ✓ رقمي
  [صورة التوقيع]
```

### الحالة 2: اسم مطبوع فقط
```
المستخدم: يكتب اسمه فقط
النتيجة في PDF:
  التوقيع: ✓ مطبوع
  [صندوق الاسم المطبوع]
```

### الحالة 3: الاتنين معاً ⭐
```
المستخدم: يوقع على Canvas + يكتب اسمه
النتيجة في PDF:
  التوقيع: ✓ رقمي + ✓ مطبوع
  
  التوقيع الرقمي:
  [صورة التوقيع]
  
  الاسم المطبوع:
  [صندوق الاسم المطبوع]
```

---

## قاعدة البيانات

### البيانات المحفوظة:
```json
{
  "bidderName": "أحمد محمد",
  "signature": "data:image/png;base64,...", // التوقيع الرقمي
  "typedName": "أحمد محمد علي",            // الاسم المطبوع
  // ... باقي البيانات
}
```

**الاتنين بيتحفظوا معاً** في قاعدة البيانات Firebase Realtime Database.

---

## واجهة المستخدم

### الرسالة الجديدة:
```
قبل 🔴:
✅ تم التوقيع أو إدخال الاسم بنجاح

بعد 🟢:
✅ تم التوقيع أو إدخال الاسم بنجاح (يمكنك إضافة الاتنين)
```

هذا يخبر المستخدم أنه يمكنه إضافة الاتنين معاً.

---

## الميزات الجديدة

### ✅ مرونة أكبر
المستخدم يقدر يختار:
- توقيع رقمي فقط
- اسم مطبوع فقط
- **الاتنين معاً** (جديد!)

### ✅ لا مسح تلقائي
- لما تضيف واحد، التاني مش بيتمسح
- يمكنك إضافة واحد بعد التاني بدون مشاكل

### ✅ عرض واضح في PDF
- كل واحد بيتعرض بشكل منفصل
- عنوان واضح لكل واحد
- سهل التمييز بينهم

### ✅ حفظ كامل
- الاتنين بيتحفظوا في قاعدة البيانات
- الاتنين بيظهروا في PDF
- لا فقدان للبيانات

---

## الاختبار

### جرب السيناريوهات:

#### السيناريو 1: توقيع رقمي فقط
1. وقع على Canvas
2. اضغط "تسجيل المشاركة"
3. افتح PDF
4. تحقق: يظهر التوقيع الرقمي ✅

#### السيناريو 2: اسم مطبوع فقط
1. اكتب اسمك في حقل "الاسم المطبوع"
2. اضغط "تسجيل المشاركة"
3. افتح PDF
4. تحقق: يظهر الاسم المطبوع ✅

#### السيناريو 3: الاتنين معاً ⭐
1. وقع على Canvas
2. اكتب اسمك في حقل "الاسم المطبوع"
3. اضغط "تسجيل المشاركة"
4. افتح PDF
5. تحقق: يظهر الاتنين ✅✅

---

## قبل وبعد

### قبل 🔴:
```
المستخدم يوقع → الاسم المطبوع يُمسح
المستخدم يكتب اسمه → التوقيع يُمسح
النتيجة: واحد فقط يُحفظ
```

### بعد 🟢:
```
المستخدم يوقع → الاسم المطبوع يبقى
المستخدم يكتب اسمه → التوقيع يبقى
النتيجة: الاتنين يُحفظوا ✅
```

---

## الخلاصة

تم تحديث النظام ليدعم:
- ✅ التوقيع الرقمي
- ✅ الاسم المطبوع
- ✅ **الاتنين معاً** (الميزة الجديدة)

**الآن المستخدم عنده مرونة أكبر ولا يفقد أي بيانات!** 🎉

---

## الملفات المحدثة

1. `src/app/register/page.tsx`
   - تحديث `onSubmit`
   - تحديث `onSignatureChange`
   - تحديث `onChange` للاسم المطبوع

2. `src/lib/robustPdfGenerator.ts`
   - تحديث `generateDeclarationPNG`
   - تحديث `generateReceiptPNG`
   - عرض الاتنين في PDF

---

**تمام! النظام الآن يدعم الاتنين معاً! 🚀**

