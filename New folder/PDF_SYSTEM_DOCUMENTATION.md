# نظام توليد PDF المحدث - دليل شامل

## نظرة عامة

تم تحديث نظام توليد PDF ليدعم اللغة العربية بشكل كامل مع إظهار التوقيعات واللوجو والختم بشكل صحيح.

## كيف يعمل النظام

### 1. المستخدم يملأ النموذج
- يملأ المستخدم النموذج في `src/app/register/page.tsx`
- يتم حفظ التوقيع (إما توقيع رقمي أو اسم مطبوع) في `formData.signature`

### 2. عند الضغط على "تسجيل المشاركة"
```typescript
const onSubmit = async (data: ValidatedFormData) => {
  // 1. التحقق من وجود التوقيع
  if (!signature) {
    alert('يرجى التوقيع على النموذج');
    return;
  }
  
  // 2. حفظ البيانات في قاعدة البيانات
  const result = await saveRegistration(registrationData);
  
  // 3. تعيين رقم المضرب وفتح SubmitFlowModal
  setBidderNumber(result.bidderNumber);
  setSubmittedFormData(pdfFormData);
  setIsSubmitFlowOpen(true);
}
```

### 3. توليد PDF

#### الخطوة 1: إنشاء صورة PNG بالبيانات العربية
```typescript
// في robustPdfGenerator.ts
export async function generateReceiptPNG(formData: ValidatedFormData, bidderNumber?: number) {
  // 1. إنشاء عنصر HTML مؤقت بالبيانات
  const tempElement = document.createElement('div');
  
  // 2. إضافة اللوجو في الأعلى
  <img src="/Asset%202@2x.png" />
  
  // 3. إضافة البيانات بالعربية
  - اسم المزايد
  - رقم الهوية
  - رقم الجوال
  - البنك المصدر
  - تفاصيل الشيكات
  
  // 4. إضافة التوقيع
  if (formData.signature && formData.signature.startsWith('data:image')) {
    <img src="${formData.signature}" />
  }
  
  // 5. إضافة الختم في أسفل اليسار
  <img src="/company-seal.png" style="position: absolute; bottom: 20px; left: 20px;" />
  
  // 6. استخدام html2canvas لإنشاء صورة PNG
  const canvas = await html2canvas(tempElement, {
    scale: 2, // جودة عالية
    useCORS: true,
    backgroundColor: '#ffffff'
  });
  
  // 7. تحويل Canvas إلى PNG blob
  const pngBlob = await canvas.toBlob();
  
  return pngBlob;
}
```

#### الخطوة 2: تحويل PNG إلى PDF
```typescript
export async function convertPNGToPDF(pngBlob: Blob) {
  // 1. استيراد jsPDF
  const { jsPDF } = await import('jspdf');
  
  // 2. إنشاء مستند PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // 3. تحويل PNG blob إلى data URL
  const pngDataURL = await blobToDataURL(pngBlob);
  
  // 4. إضافة الصورة إلى PDF (تملأ الصفحة بالكامل)
  doc.addImage(pngDataURL, 'PNG', 0, 0, 210, 297);
  
  // 5. توليد PDF blob
  const pdfBlob = doc.output('blob');
  
  return pdfBlob;
}
```

### 4. تحميل PDF
```typescript
// في useSubmitFlow.ts
if (!isEmployeePage && declarationResult.blob) {
  const url = URL.createObjectURL(declarationResult.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `declaration_${formData.bidderName}_${Date.now()}.pdf`;
  a.click();
}
```

## الملفات المحدثة

### 1. `src/lib/robustPdfGenerator.ts`
- ✅ `generateReceiptPNG()` - يولد صورة PNG للإيصال بالعربية مع التوقيع واللوجو والختم
- ✅ `generateDeclarationPNG()` - يولد صورة PNG للإقرار بالعربية مع التوقيع واللوجو والختم
- ✅ `convertPNGToPDF()` - يحول صورة PNG إلى PDF
- ✅ `generateRobustReceiptPDF()` - دالة رئيسية لتوليد PDF الإيصال
- ✅ `generateRobustDeclarationPDF()` - دالة رئيسية لتوليد PDF الإقرار

### 2. `src/hooks/useSubmitFlow.ts`
- ✅ تحديث لتمرير `bidderNumber` إلى دوال توليد PDF
- ✅ تحميل PDF تلقائياً بعد التوليد

### 3. `src/app/register/page.tsx`
- ✅ يدعم التوقيع الرقمي والاسم المطبوع
- ✅ يحفظ التوقيع في `formData.signature`

### 4. `src/components/SignatureCanvas.tsx`
- ✅ يولد صورة التوقيع بصيغة `data:image/png`
- ✅ يتم حفظ التوقيع في حالة `signature`

## المميزات الجديدة

### 1. دعم كامل للغة العربية
- ✅ النص العربي يظهر بشكل صحيح في PDF
- ✅ استخدام `html2canvas` بدلاً من `jsPDF` مباشرة
- ✅ استخدام خط `Arial` الذي يدعم العربية

### 2. إظهار التوقيع
- ✅ التوقيع الرقمي يظهر في PDF
- ✅ الاسم المطبوع يظهر في صندوق مخصص
- ✅ التوقيع يتم حفظه في قاعدة البيانات

### 3. اللوجو والختم
- ✅ اللوجو يظهر في الأعلى
- ✅ الختم يظهر في أسفل اليسار
- ✅ استخدام `crossorigin="anonymous"` لتحميل الصور

### 4. رقم المضرب
- ✅ يتم توليد رقم مضرب تلقائياً
- ✅ يظهر في PDF
- ✅ يتم حفظه في قاعدة البيانات

## الاختبار

### اختبار النظام الكامل:
1. افتح `http://localhost:3000/register`
2. املأ النموذج بالبيانات
3. وقع التوقيع أو أدخل اسمك المطبوع
4. اضغط على "تسجيل المشاركة"
5. انتظر توليد PDF
6. تحقق من:
   - ✅ النص العربي يظهر بشكل صحيح
   - ✅ التوقيع يظهر في PDF
   - ✅ اللوجو يظهر في الأعلى
   - ✅ الختم يظهر في أسفل اليسار
   - ✅ رقم المضرب يظهر في PDF

## المشاكل التي تم حلها

### 1. النص العربي يظهر كأحرف غريبة
- ❌ **المشكلة**: استخدام `jsPDF` مباشرة لا يدعم العربية جيداً
- ✅ **الحل**: استخدام `html2canvas` لإنشاء صورة PNG ثم تحويلها إلى PDF

### 2. التوقيع لا يظهر في PDF
- ❌ **المشكلة**: `formData.signature` لم يكن يتم تمريره بشكل صحيح
- ✅ **الحل**: تمرير `formData.signature` مع البيانات وإضافته في HTML

### 3. اللوجو والختم لا يظهران
- ❌ **المشكلة**: مسارات الصور غير صحيحة أو لا يتم تحميلها
- ✅ **الحل**: استخدام `crossorigin="anonymous"` والانتظار لتحميل الصور

### 4. رقم المضرب لا يظهر
- ❌ **المشكلة**: `bidderNumber` لم يكن يتم تمريره إلى دوال توليد PDF
- ✅ **الحل**: تحديث جميع الدوال لقبول وتمرير `bidderNumber`

## الملفات غير المستخدمة

هذه الملفات موجودة لكن لم يعد يتم استخدامها:

- ❌ `src/lib/simplePngToPdf.ts` - استخدم `robustPdfGenerator.ts` بدلاً منه
- ❌ `src/lib/pdfGenerator.ts` - استخدم `robustPdfGenerator.ts` بدلاً منه
- ❌ `src/lib/enhancedPdfGenerator.ts` - استخدم `robustPdfGenerator.ts` بدلاً منه

## ملاحظات مهمة

1. **جودة الصورة**: استخدام `scale: 2` في `html2canvas` لجودة عالية
2. **حجم الملف**: استخدام PNG بدلاً من JPEG لجودة أفضل
3. **التوافق**: النظام يعمل على جميع المتصفحات الحديثة
4. **الأمان**: جميع البيانات تُعالج في المتصفح فقط

## الدعم الفني

إذا واجهت أي مشاكل:
1. تأكد من وجود الصور في المسارات الصحيحة:
   - `/public/Asset 2@2x.png` (اللوجو)
   - `/public/company-seal.png` (الختم)
2. تأكد من تثبيت جميع المكتبات المطلوبة:
   ```bash
   npm install html2canvas jspdf
   ```
3. افتح Console في المتصفح لرؤية أي أخطاء

## الخلاصة

النظام الآن يعمل بشكل كامل ويدعم:
- ✅ اللغة العربية
- ✅ التوقيع الرقمي والاسم المطبوع
- ✅ اللوجو والختم
- ✅ رقم المضرب
- ✅ تحميل PDF تلقائياً

**النظام جاهز للاستخدام! 🎉**

