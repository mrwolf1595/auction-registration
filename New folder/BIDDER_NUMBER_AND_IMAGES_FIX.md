# إصلاح رقم المضرب وتكبير اللوجو والختم

## ✅ **التغييرات المطبقة:**

### 1. **تغيير رقم التسجيل إلى رقم المضرب:**

#### **في قاعدة البيانات:**
- ✅ **إضافة حقل `bidderNumber`** في واجهة `Registration`
- ✅ **إضافة حقل `totalAmount`** لحفظ إجمالي مبلغ الشيكات
- ✅ **تحديث دالة `saveRegistration`** لحفظ رقم المضرب وإجمالي المبلغ

```typescript
// في src/lib/database.ts
export interface Registration {
  // ... باقي الحقول
  bidderNumber?: number; // رقم المضرب (بدلاً من رقم التسجيل)
  totalAmount?: number; // إجمالي مبلغ الشيكات
}
```

#### **في الاقرار:**
- ✅ **تغيير "رقم التسجيل" إلى "رقم المضرب"** في جميع ملفات PDF
- ✅ **تحديث دالة `generateDeclarationPNG`** لطباعة رقم المضرب
- ✅ **تحديث دالة `generateDeclarationPDFWithJSPDF`** لطباعة رقم المضرب

```typescript
// قبل الإصلاح
doc.text(`رقم التسجيل: ${registrationNumber}`, 105, 30, { align: 'center' });

// بعد الإصلاح
doc.text(`رقم المضرب: ${bidderNumber}`, 105, 35, { align: 'center' });
```

### 2. **تسجيل بيانات الشيكات:**

#### **في قاعدة البيانات:**
- ✅ **حفظ أرقام الشيكات** في حقل `cheques`
- ✅ **حفظ مبالغ الشيكات** في حقل `cheques`
- ✅ **حساب إجمالي المبلغ** تلقائياً وحفظه في `totalAmount`

```typescript
// حساب إجمالي مبلغ الشيكات
const totalAmount = registration.cheques.reduce((sum, cheque) => {
  const amount = parseFloat(cheque.amount.replace(/,/g, '')) || 0;
  return sum + amount;
}, 0);

// توليد رقم المضرب (1-200)
const bidderNumber = Math.floor(Math.random() * 200) + 1;
```

### 3. **تكبير اللوجو والختم:**

#### **اللوجو:**
- ✅ **في دالة `generateDeclarationPNG`:** من `120x40px` إلى `180x60px`
- ✅ **في دالة `generateDeclarationPDFWithJSPDF`:** من `60x20mm` إلى `80x30mm`

```typescript
// قبل الإصلاح
<img src="/Asset 2@2x.png" style="max-width: 120px; max-height: 40px;" />
doc.addImage(logoDataURL, 'PNG', 75, 5, 60, 20);

// بعد الإصلاح
<img src="/Asset 2@2x.png" style="max-width: 180px; max-height: 60px;" />
doc.addImage(logoDataURL, 'PNG', 65, 5, 80, 30);
```

#### **الختم:**
- ✅ **في دالة `generateDeclarationPNG`:** من `60x60px` إلى `90x90px`
- ✅ **في دالة `generateDeclarationPDFWithJSPDF`:** من `30x30mm` إلى `45x45mm`

```typescript
// قبل الإصلاح
<img src="/company-seal.png" style="max-width: 60px; max-height: 60px;" />
doc.addImage(sealDataURL, 'PNG', 20, 250, 30, 30);

// بعد الإصلاح
<img src="/company-seal.png" style="max-width: 90px; max-height: 90px;" />
doc.addImage(sealDataURL, 'PNG', 20, 250, 45, 45);
```

## 🎯 **النتيجة النهائية:**

### **في قاعدة البيانات:**
- ✅ **رقم المضرب** يتم حفظه تلقائياً (1-200)
- ✅ **أرقام الشيكات** محفوظة في حقل `cheques`
- ✅ **مبالغ الشيكات** محفوظة في حقل `cheques`
- ✅ **إجمالي المبلغ** محسوب تلقائياً ومحفوظ في `totalAmount`

### **في الاقرار:**
- ✅ **"رقم المضرب"** يظهر بدلاً من "رقم التسجيل"
- ✅ **اللوجو أكبر وأوضح** (180x60px)
- ✅ **الختم أكبر وأوضح** (90x90px)

## 📋 **مثال على البيانات المحفوظة:**

```json
{
  "id": "abc123",
  "bidderName": "أحمد محمد",
  "idNumber": "1234567890",
  "phoneNumber": "0501234567",
  "cheques": [
    { "number": "123456", "amount": "50000" },
    { "number": "789012", "amount": "30000" }
  ],
  "bidderNumber": 107,
  "totalAmount": 80000,
  "registrationDate": "2025-01-15T10:30:00.000Z",
  "status": "pending"
}
```

## 🎉 **النتيجة:**
الآن التطبيق يحفظ رقم المضرب وبيانات الشيكات في قاعدة البيانات، ويطبع رقم المضرب في الاقرار مع لوجو وختم أكبر وأوضح!
