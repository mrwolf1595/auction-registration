# إصلاح عرض البيانات الكاملة في ملفات PDF

## المشكلة
كانت البيانات المسجلة من المستخدم لا تظهر كاملة في الملفات المحملة. البيانات المفقودة تشمل:
- تفاصيل الشيكات (رقم الشيك والمبلغ)
- المجموع الكلي
- التوقيع الإلكتروني
- بنود الإقرار والتعهد

## الحل المطبق

### 1. إضافة جدول تفاصيل الشيكات
```typescript
// Cheques table for declaration
ctx.textAlign = 'center';
ctx.font = 'bold 26px Arial, sans-serif';
ctx.fillStyle = '#1f2937';
ctx.fillText('تفاصيل الشيكات', 397, yPosition);
yPosition += 45;

// Create professional table for declaration
const tableX = 70;
const tableY = yPosition;
const tableWidth = 654;
const rowHeight = 50;
const colWidth = tableWidth / 2;
```

### 2. عرض بيانات الشيكات
```typescript
formData.cheques.forEach((cheque, index) => {
  const rowY = tableY + (index + 1) * rowHeight;
  
  // Alternate row colors
  if (index % 2 === 0) {
    ctx.fillStyle = '#f9fafb';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(tableX, rowY, tableWidth, rowHeight);
  
  // Text
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText(cheque.number, tableX + colWidth/2, rowY + 32);
  ctx.fillText(formatNumber(cheque.amount), tableX + colWidth + colWidth/2, rowY + 32);
});
```

### 3. إضافة المجموع الكلي
```typescript
// Total row with gold styling
const totalRowY = tableY + (formData.cheques.length + 1) * rowHeight;

const totalGradient = ctx.createLinearGradient(tableX, totalRowY, tableX, totalRowY + rowHeight);
totalGradient.addColorStop(0, '#fbbf24');
totalGradient.addColorStop(1, '#f59e0b');

ctx.fillStyle = totalGradient;
ctx.fillRect(tableX, totalRowY, tableWidth, rowHeight);

ctx.font = 'bold 24px Arial, sans-serif';
ctx.fillStyle = '#ffffff';
ctx.fillText('المجموع الكلي', tableX + colWidth/2, totalRowY + 32);
ctx.fillText(formatNumber(totalAmount.toString()), tableX + colWidth + colWidth/2, totalRowY + 32);
```

### 4. إضافة بنود الإقرار والتعهد
```typescript
// Declaration clauses
ctx.font = 'bold 26px Arial, sans-serif';
ctx.fillStyle = '#1f2937';
ctx.textAlign = 'center';
ctx.fillText('إقرار وتعهد', 397, yPosition);
yPosition += 40;

const arabicClauses = [
  'أقر وأتعهد بأن جميع البيانات المدخلة صحيحة ومطابقة للواقع.',
  'أقر وأتعهد بأنني أتحمل المسؤولية الكاملة عن صحة الشيكات المقدمة.',
  'أقر وأتعهد بأنني سأقوم بسداد جميع المبالغ المستحقة في المواعيد المحددة.',
  'أقر وأتعهد بأنني لن أتراجع عن المشاركة في المزاد بعد تقديم العطاء.',
  'أقر وأتعهد بأنني سألتزم بجميع الشروط والأحكام المعلنة.'
];

ctx.font = '16px Arial, sans-serif';
ctx.fillStyle = '#374151';
ctx.textAlign = 'right';

arabicClauses.forEach((clause, index) => {
  ctx.fillText(`${index + 1}. ${clause}`, 700, yPosition);
  yPosition += 25;
});
```

### 5. دعم التوقيع الإلكتروني
```typescript
// Add electronic signature if available
if (formData.signature && formData.signature.startsWith('data:image')) {
  try {
    const signatureImg = new Image();
    signatureImg.crossOrigin = 'anonymous';
    signatureImg.src = formData.signature;
    await new Promise((resolve) => {
      signatureImg.onload = () => {
        // Draw signature image in the box
        const sigImgWidth = Math.min(sigBoxWidth - 20, 200);
        const sigImgHeight = Math.min(sigBoxHeight - 40, 60);
        const sigImgX = sigBoxX + (sigBoxWidth - sigImgWidth) / 2;
        const sigImgY = sigBoxY + 20;
        
        ctx.drawImage(signatureImg, sigImgX, sigImgY, sigImgWidth, sigImgHeight);
        resolve(true);
      };
      signatureImg.onerror = () => {
        // Fallback to text if image fails
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(formData.typedName || formData.bidderName, 397, sigBoxY + 60);
        resolve(true);
      };
    });
  } catch (error) {
    // Fallback to text
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(formData.typedName || formData.bidderName, 397, sigBoxY + 60);
  }
} else {
  // No signature image, show typed name
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(formData.typedName || formData.bidderName, 397, sigBoxY + 60);
}
```

## البيانات المعروضة الآن

### في ملف الإيصال (للموظف):
- ✅ اسم المزايد
- ✅ رقم الهوية
- ✅ رقم الجوال
- ✅ البنك المصدر
- ✅ تفاصيل الشيكات (رقم + مبلغ)
- ✅ المجموع الكلي
- ✅ اسم الموظف
- ✅ التوقيع الإلكتروني (صورة أو نص)

### في ملف الإقرار (للعميل):
- ✅ اسم المزايد
- ✅ رقم الهوية
- ✅ رقم الجوال
- ✅ البنك المصدر
- ✅ تفاصيل الشيكات (رقم + مبلغ)
- ✅ المجموع الكلي
- ✅ بنود الإقرار والتعهد (5 بنود)
- ✅ التوقيع الإلكتروني (صورة أو نص)

## المميزات الجديدة

### 1. تصميم احترافي
- جداول بألوان متدرجة
- صفوف متناوبة الألوان
- حدود واضحة
- خطوط عريضة للعناوين

### 2. دعم التوقيع الإلكتروني
- عرض صورة التوقيع إذا كانت متاحة
- fallback للنص إذا فشل تحميل الصورة
- حجم مناسب للصورة داخل المربع

### 3. تنسيق عربي محسن
- محاذاة من اليمين لليسار
- خطوط واضحة للعربية
- مسافات مناسبة بين العناصر

### 4. معلومات شاملة
- جميع البيانات المسجلة تظهر في الملف
- بنود قانونية واضحة
- تنسيق منظم وسهل القراءة

## الملفات المحدثة
- `src/lib/enhancedPngToPdf.ts` - إضافة جميع البيانات المفقودة ودعم التوقيع الإلكتروني

## النتيجة
الآن الملفات المحملة تحتوي على جميع البيانات المسجلة من المستخدم، مع تصميم احترافي ودعم كامل للتوقيع الإلكتروني.
