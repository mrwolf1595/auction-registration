import * as yup from 'yup';

// Saudi phone number validation
const saudiPhoneRegex = /^(05|5)[0-9]{8}$/;

// ID number validation (10-12 digits)
const idNumberRegex = /^[0-9]{10,12}$/;

// Validation schema
export const registrationSchema = yup.object().shape({
  // Basic information
  bidderName: yup
    .string()
    .required('اسم المزايد مطلوب')
    .min(3, 'اسم المزايد يجب أن يكون 3 أحرف على الأقل')
    .matches(/^[\u0600-\u06FF\s]+$/, 'اسم المزايد يجب أن يحتوي على أحرف عربية فقط'),

  idNumber: yup
    .string()
    .required('رقم الهوية مطلوب')
    .matches(/^[0-9]+$/, 'رقم الهوية يجب أن يحتوي على أرقام فقط')
    .matches(idNumberRegex, 'رقم الهوية يجب أن يكون بين 10-12 رقم'),

  phoneNumber: yup
    .string()
    .required('رقم الجوال مطلوب')
    .matches(saudiPhoneRegex, 'رقم الجوال يجب أن يكون بصيغة سعودية صحيحة (05xxxxxxxx)'),

  email: yup
    .string()
    .optional()
    .email('البريد الإلكتروني غير صحيح'),

  address: yup
    .string()
    .optional()
    .max(500, 'العنوان يجب أن يكون أقل من 500 حرف'),

  auction: yup
    .string()
    .optional(),

  // Cheque information
  checkCount: yup
    .string()
    .required('عدد الشيكات مطلوب')
    .oneOf(['1', '2', '3', '4', '5'], 'عدد الشيكات غير صحيح'),

  issuingBank: yup
    .string()
    .required('البنك المصدر للشيك مطلوب'),

  // Dynamic cheque fields
  cheques: yup.array().of(
    yup.object().shape({
      number: yup
        .string()
        .required('رقم الشيك مطلوب')
        .matches(/^[0-9]+$/, 'رقم الشيك يجب أن يحتوي على أرقام فقط')
        .min(1, 'رقم الشيك لا يمكن أن يكون فارغاً')
        .max(20, 'رقم الشيك يجب أن يكون أقل من 20 رقم'),
      amount: yup
        .string()
        .required('مبلغ الشيك مطلوب')
        .matches(/^[0-9,]+$/, 'المبلغ يجب أن يحتوي على أرقام و فواصل فقط')
        .test('is-positive', 'المبلغ يجب أن يكون أكبر من صفر', function(value) {
          if (!value) return false;
          const numericValue = parseFloat(value.replace(/,/g, ''));
          return numericValue > 0;
        })
        .test('max-amount', 'المبلغ كبير جداً', function(value) {
          if (!value) return true;
          const numericValue = parseFloat(value.replace(/,/g, ''));
          return numericValue <= 999999999; // Max 999M
        })
    })
  ).min(1, 'يجب إدخال شيك واحد على الأقل').required('يجب إدخال شيك واحد على الأقل'),

  // Employee and signature
  employeeName: yup
    .string()
    .required('اسم الموظف مطلوب'),

  signature: yup
    .string()
    .optional()
    .test('signature-or-typed-name', 'يجب إدخال التوقيع أو الاسم المطبوع', function(value) {
      const { typedName } = this.parent;
      return value || (typedName && typedName.trim().length > 0);
    }),

  typedName: yup
    .string()
    .optional()
    .test('signature-or-typed-name', 'يجب إدخال التوقيع أو الاسم المطبوع', function(value) {
      const { signature } = this.parent;
      return signature || (value && value.trim().length > 0);
    })
});

// Type for the validated form data
export type ValidatedFormData = yup.InferType<typeof registrationSchema>;

// Utility function to format Saudi phone number
export const formatSaudiPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned;
  }
  return cleaned.slice(0, 10);
};

// Utility function to validate Saudi phone number
export const validateSaudiPhone = (phone: string): boolean => {
  return saudiPhoneRegex.test(phone);
};

// Utility function to validate ID number
export const validateIdNumber = (id: string): boolean => {
  return idNumberRegex.test(id);
};
