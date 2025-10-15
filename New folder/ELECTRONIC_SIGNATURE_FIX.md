# إصلاح التوقيع الإلكتروني في ملفات PDF

## المشكلة
التوقيع الإلكتروني لم يظهر في الملفات المحملة رغم وجوده في قاعدة البيانات.

## البيانات من قاعدة البيانات
```json
{
  "signature": "اللي اتخزم",
  "typedName": "اللي اتخزم"
}
```

## السبب
الكود كان يبحث عن توقيع بصيغة صورة (`data:image`) فقط، لكن التوقيع في قاعدة البيانات هو نص.

## الحل المطبق

### 1. دعم التوقيع النصي
```typescript
// Add signature (image or text) for employee
console.log('Employee signature data:', formData.signature);
if (formData.signature && formData.signature.startsWith('data:image')) {
  // Handle image signature
  // ... image handling code
} else if (formData.signature && formData.signature.trim()) {
  // Handle text signature
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText(formData.signature, 397, sigBoxY + 60);
} else {
  // No signature, show employee name
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(formData.employeeName, 397, sigBoxY + 60);
}
```

### 2. دعم التوقيع النصي للعملاء
```typescript
// Add signature (image or text) for customer
console.log('Customer signature data:', formData.signature);
if (formData.signature && formData.signature.startsWith('data:image')) {
  // Handle image signature
  // ... image handling code
} else if (formData.signature && formData.signature.trim()) {
  // Handle text signature
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText(formData.signature, 397, sigBoxY + 60);
} else {
  // No signature, show typed name or bidder name
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(formData.typedName || formData.bidderName, 397, sigBoxY + 60);
}
```

## المميزات الجديدة

### 1. دعم أنواع التوقيع المختلفة
- ✅ توقيع بصيغة صورة (`data:image/png;base64,...`)
- ✅ توقيع نصي (`"اللي اتخزم"`)
- ✅ fallback للاسم إذا لم يوجد توقيع

### 2. تنسيق محسن للتوقيع
- خط عريض للتمييز
- لون أزرق للوضوح
- محاذاة وسط

### 3. تتبع البيانات
- console.log لعرض بيانات التوقيع
- معالجة الأخطاء المحسنة

## النتيجة المتوقعة
الآن عندما يقوم المستخدم بتحميل الملف، سيظهر:
- **التوقيع النصي**: "اللي اتخزم" بخط عريض وأزرق
- **في مربع التوقيع**: داخل المربع المنقط
- **للموظف والعملاء**: نفس المعالجة

## الملفات المحدثة
- `src/lib/enhancedPngToPdf.ts` - إضافة دعم التوقيع النصي

## الاختبار
1. افتح `http://localhost:3000/debug-png`
2. اضغط "اختبار إنشاء PDF من PNG"
3. تحقق من console.log لرؤية بيانات التوقيع
4. حمل الملف وتأكد من ظهور التوقيع "اللي اتخزم"
