# إصلاح وتحسين تصميم ملفات PDF

## المشاكل التي تم حلها

### 1. التبديل إلى robustPdfGenerator.ts
- **المشكلة**: كان يتم استخدام `enhancedPngToPdf.ts` بدلاً من `robustPdfGenerator.ts`
- **الحل**: تم التبديل إلى `robustPdfGenerator.ts` لأنه أفضل وأكثر استقراراً

### 2. تحسين تخطيط البيانات
- **المشكلة**: البيانات كانت مرتبة عمودياً وتأخذ مساحة كبيرة
- **الحل**: تم ترتيب البيانات أفقياً في صفين:
  - الصف الأول: الاسم والهوية
  - الصف الثاني: الجوال والبنك

### 3. تصغير العنوان واللوجو
- **المشكلة**: العنوان واللوجو كانا كبيرين جداً
- **الحل**: 
  - تقليل حجم العنوان من 20 إلى 16
  - تصغير اللوجو من 80x30 إلى 60x20

### 4. إزالة اللون الأزرق من العنوان
- **المشكلة**: العنوان كان باللون الأزرق (cyan)
- **الحل**: تم تغييره إلى اللون الأسود

### 5. إضافة حواف للعناصر
- **المشكلة**: عدم وجود حواف واضحة للعناصر
- **الحل**: إضافة مربع بحدود رمادية لبيانات المزايد

## الكود المطبق

### 1. التبديل إلى robustPdfGenerator
```typescript
// في useSubmitFlow.ts
import { generateRobustReceiptPDF, generateRobustDeclarationPDF } from '@/lib/robustPdfGenerator';

// استخدام الدوال الجديدة
const pdfResult = await generateRobustReceiptPDF(formData);
```

### 2. تحسين العنوان
```typescript
// Header - smaller and without blue color
doc.setFontSize(16);
doc.setTextColor(0, 0, 0); // Black color instead of cyan
doc.text('إيصال استلام - للموظف', 105, 20, { align: 'center' });
```

### 3. تصغير اللوجو
```typescript
// Add logo image (centered, above the title) - تصغير اللوجو
doc.addImage(logoDataURL, 'PNG', 75, 5, 60, 20); // x=75, y=5, width=60, height=20
```

### 4. التخطيط الأفقي للبيانات
```typescript
// Create a box for bidder information
const boxX = 20;
const boxY = yPosition - 5;
const boxWidth = 170;
const boxHeight = 25;

// Draw box border
doc.setDrawColor(200, 200, 200);
doc.setLineWidth(0.5);
doc.rect(boxX, boxY, boxWidth, boxHeight);

// Bidder Information - Horizontal layout
doc.setFontSize(10);
doc.setTextColor(0, 0, 0);

// First row: Name and ID
doc.text(`الاسم: ${formData.bidderName}`, 25, yPosition + 3, { align: 'right' });
doc.text(`الهوية: ${formData.idNumber}`, 25, yPosition + 3, { align: 'left' });

// Second row: Phone and Bank
doc.text(`الجوال: ${formData.phoneNumber}`, 25, yPosition + 8, { align: 'right' });
doc.text(`البنك: ${formData.issuingBank}`, 25, yPosition + 8, { align: 'left' });
```

### 5. تتبع التوقيع الرقمي
```typescript
console.log('Receipt signature data:', formData.signature);
console.log('Declaration signature data:', formData.signature);
```

## النتائج

### 1. توفير المساحة
- البيانات الآن تأخذ مساحة أقل بكثير
- يمكن عرض 5 شيكات بسهولة في الصفحة

### 2. تصميم أنظف
- العنوان أصغر وأوضح
- اللوجو متناسب مع المحتوى
- حواف واضحة للعناصر

### 3. استقرار أفضل
- استخدام `robustPdfGenerator.ts` الأكثر استقراراً
- دعم أفضل للعربية
- fallback mechanism محسن

### 4. تتبع التوقيع
- console.log لتتبع بيانات التوقيع
- يمكن تحديد سبب عدم ظهور التوقيع الرقمي

## الملفات المحدثة
- `src/hooks/useSubmitFlow.ts` - التبديل إلى robustPdfGenerator
- `src/lib/robustPdfGenerator.ts` - تحسين التصميم والتخطيط

## الاختبار
1. افتح `http://localhost:3000/debug-png`
2. اضغط "اختبار إنشاء PDF من PNG"
3. تحقق من console.log لرؤية بيانات التوقيع
4. حمل الملف وتأكد من التحسينات

## ملاحظات مهمة
- التوقيع الرقمي من signatureCanvas يحتاج فحص إضافي
- قد تحتاج إلى التحقق من كيفية حفظ التوقيع في قاعدة البيانات
- النظام الآن يستخدم المولد الأكثر استقراراً
