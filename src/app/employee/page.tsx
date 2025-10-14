'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Link from 'next/link';
import { ValidatedFormData } from '@/lib/validation';
import PreviewModal from '@/components/PreviewModal';
import SubmitFlowModal from '@/components/SubmitFlowModal';

// Saudi Banks data
const saudiBanks = [
  'البنك الأهلي السعودي',
  'بنك الراجحي',
  'البنك السعودي الفرنسي',
  'بنك ساب',
  'البنك السعودي للاستثمار',
  'بنك الجزيرة',
  'البنك السعودي الهولندي',
  'بنك الإنماء',
  'البنك السعودي البريطاني',
  'بنك الخليج الدولي',
  'البنك العربي الوطني',
  'بنك الرياض',
  'البنك السعودي الألماني',
  'بنك الإمارات دبي الوطني',
  'البنك السعودي الكويتي'
];

// Employee names data
const employeeNames = [
  'أحمد',
  'محمد',
  'فهد',
  'علي',
  'عبدالله'
];

// Utility function to format numbers with thousand separators
const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Utility function to parse formatted number
const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

export default function EmployeePage() {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitFlowOpen, setIsSubmitFlowOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<ValidatedFormData>({
    defaultValues: {
      bidderName: '',
      idNumber: '',
      phoneNumber: '',
      checkCount: '1',
      issuingBank: '',
      cheques: [{ number: '', amount: '' }],
      employeeName: '',
      signature: '',
      typedName: ''
    }
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'cheques'
  });

  const watchCheckCount = watch('checkCount');
  const watchCheques = watch('cheques');

  // Calculate total amount
  const totalAmount = watchCheques.reduce((sum, cheque) => {
    return sum + parseNumber(cheque.amount || '0');
  }, 0);

  // Update cheque fields when check count changes
  useEffect(() => {
    const count = parseInt(watchCheckCount);
    const currentCheques = getValues('cheques');
    const newCheques = Array.from({ length: count }, (_, index) => ({
      number: currentCheques[index]?.number || '',
      amount: currentCheques[index]?.amount || ''
    }));
    replace(newCheques);
  }, [watchCheckCount, replace, getValues]);

  const onSubmit = (data: ValidatedFormData) => {
    console.log('Form submitted:', data);
    // Start the complete submit flow
    setIsSubmitFlowOpen(true);
  };

  const handlePreview = () => {
    const formData = getValues();
    
    // Basic validation checks
    const errors: string[] = [];
    
    if (!formData.bidderName || formData.bidderName.length < 3) {
      errors.push('اسم المزايد يجب أن يكون 3 أحرف على الأقل');
    }
    
    if (!formData.idNumber || !/^[0-9]{10,12}$/.test(formData.idNumber)) {
      errors.push('رقم الهوية يجب أن يكون بين 10-12 رقم');
    }
    
    if (!formData.phoneNumber || !/^(05|5)[0-9]{8}$/.test(formData.phoneNumber)) {
      errors.push('رقم الجوال يجب أن يكون بصيغة سعودية صحيحة');
    }
    
    if (!formData.employeeName) {
      errors.push('اسم الموظف مطلوب');
    }
    
    if (!formData.signature && !formData.typedName) {
      errors.push('يجب إدخال التوقيع أو الاسم المطبوع');
    }
    
    if (errors.length > 0) {
      alert('يرجى تصحيح الأخطاء التالية:\n' + errors.join('\n'));
      return;
    }
    
    setIsPreviewOpen(true);
  };

  const onReset = () => {
    reset({
      bidderName: '',
      idNumber: '',
      phoneNumber: '',
      checkCount: '1',
      issuingBank: '',
      cheques: [{ number: '', amount: '' }],
      employeeName: '',
      signature: '',
      typedName: ''
    });
    // Clear signature canvas
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsSignatureEmpty(true);
    }
  };

  const handleNewRegistration = () => {
    onReset();
    setIsSubmitFlowOpen(false);
    setIsPreviewOpen(false);
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureDataURL = signatureRef.current.toDataURL('image/png');
      setValue('signature', signatureDataURL);
      setIsSignatureEmpty(signatureRef.current.isEmpty());
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setValue('signature', '');
      setIsSignatureEmpty(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-300 arabic-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 arabic-text">
            مراجعة وتسجيل المزاد
          </h1>
          <p className="text-xl text-gray-300 arabic-text max-w-2xl mx-auto">
            صفحة الموظفين لمراجعة بيانات المزايدين وتسجيل الإيصالات
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Glassmorphism Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white arabic-text">
                مراجعة بيانات المزايد
              </h2>
              <p className="text-gray-300 arabic-text mt-2">
                راجع بيانات المزايد وسجل اسمك في الإيصال
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Bidder Name */}
              <div className="space-y-2">
                <label 
                  htmlFor="bidderName" 
                  className="block text-sm font-medium text-cyan-300 arabic-text"
                >
                  اسم المزايد *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="bidderName"
                    placeholder="أدخل اسم المزايد الكامل"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                    aria-describedby="bidderName-error"
                    {...register('bidderName', { required: 'اسم المزايد مطلوب' })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.bidderName && (
                  <p className="text-red-400 text-sm arabic-text" id="bidderName-error">
                    {errors.bidderName.message}
                  </p>
                )}
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <label 
                  htmlFor="idNumber" 
                  className="block text-sm font-medium text-cyan-300 arabic-text"
                >
                  رقم الهوية *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="idNumber"
                    placeholder="أدخل رقم الهوية"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                    aria-describedby="idNumber-error"
                    onKeyPress={(e) => {
                      // Only allow numeric characters
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={12}
                    {...register('idNumber', { required: 'رقم الهوية مطلوب' })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                </div>
                {errors.idNumber && (
                  <p className="text-red-400 text-sm arabic-text" id="idNumber-error">
                    {errors.idNumber.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label 
                  htmlFor="phoneNumber" 
                  className="block text-sm font-medium text-cyan-300 arabic-text"
                >
                  رقم الجوال *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="05xxxxxxxx"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                    aria-describedby="phoneNumber-error"
                    onKeyPress={(e) => {
                      // Only allow numeric characters
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    {...register('phoneNumber', { required: 'رقم الجوال مطلوب' })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm arabic-text" id="phoneNumber-error">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Check Count */}
              <div className="space-y-2">
                <label 
                  htmlFor="checkCount" 
                  className="block text-sm font-medium text-cyan-300 arabic-text"
                >
                  عدد الشيكات *
                </label>
                <div className="relative">
                  <select
                    id="checkCount"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm appearance-none"
                    aria-describedby="checkCount-error"
                    {...register('checkCount', { required: 'عدد الشيكات مطلوب' })}
                  >
                    <option value="1" className="bg-slate-800 text-white">1 شيك</option>
                    <option value="2" className="bg-slate-800 text-white">2 شيك</option>
                    <option value="3" className="bg-slate-800 text-white">3 شيكات</option>
                    <option value="4" className="bg-slate-800 text-white">4 شيكات</option>
                    <option value="5" className="bg-slate-800 text-white">5 شيكات</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.checkCount && (
                  <p className="text-red-400 text-sm arabic-text" id="checkCount-error">
                    {errors.checkCount.message}
                  </p>
                )}
              </div>

              {/* Dynamic Cheque Fields */}
              {fields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-300 arabic-text border-b border-white/20 pb-2">
                    تفاصيل الشيكات
                  </h3>
                  {fields.map((field, index) => (
                    <div key={field.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="text-cyan-300 font-medium arabic-text">
                          الشيك رقم {index + 1}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cheque Number */}
                        <div className="space-y-2">
                          <label 
                            htmlFor={`cheques.${index}.number`}
                            className="block text-sm font-medium text-cyan-300 arabic-text"
                          >
                            رقم الشيك *
                          </label>
                          <input
                            type="text"
                            placeholder="أدخل رقم الشيك"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                            onKeyPress={(e) => {
                              // Only allow numeric characters
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            maxLength={20}
                            {...register(`cheques.${index}.number`, { 
                              required: 'رقم الشيك مطلوب' 
                            })}
                          />
                          {errors.cheques?.[index]?.number && (
                            <p className="text-red-400 text-sm arabic-text">
                              {errors.cheques[index]?.number?.message}
                            </p>
                          )}
                        </div>

                        {/* Cheque Amount */}
                        <div className="space-y-2">
                          <label 
                            htmlFor={`cheques.${index}.amount`}
                            className="block text-sm font-medium text-cyan-300 arabic-text"
                          >
                            مبلغ الشيك (ريال سعودي) *
                          </label>
                          <Controller
                            name={`cheques.${index}.amount`}
                            control={control}
                            rules={{ 
                              required: 'مبلغ الشيك مطلوب',
                              validate: (value) => {
                                const numValue = parseNumber(value);
                                return numValue > 0 || 'المبلغ يجب أن يكون أكبر من صفر';
                              }
                            }}
                            render={({ field }) => (
                              <input
                                type="text"
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                                value={field.value}
                                onKeyPress={(e) => {
                                  // Only allow numeric characters and comma
                                  if (!/[0-9,]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const formatted = formatNumber(e.target.value);
                                  field.onChange(formatted);
                                }}
                              />
                            )}
                          />
                          {errors.cheques?.[index]?.amount && (
                            <p className="text-red-400 text-sm arabic-text">
                              {errors.cheques[index]?.amount?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Amount Display */}
                  <div className="backdrop-blur-sm bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-cyan-300 arabic-text">
                        المجموع الكلي:
                      </span>
                      <span className="text-2xl font-bold text-white arabic-text">
                        {formatNumber(totalAmount.toString())} ريال سعودي
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Issuing Bank */}
              <div className="space-y-2">
                <label 
                  htmlFor="issuingBank" 
                  className="block text-sm font-medium text-cyan-300 arabic-text"
                >
                  البنك المصدر للشيك *
                </label>
                <div className="relative">
                  <select
                    id="issuingBank"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm appearance-none"
                    aria-describedby="issuingBank-error"
                    {...register('issuingBank', { required: 'البنك المصدر مطلوب' })}
                  >
                    <option value="" className="bg-slate-800 text-white">اختر البنك</option>
                    {saudiBanks.map((bank, index) => (
                      <option key={index} value={bank} className="bg-slate-800 text-white">
                        {bank}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.issuingBank && (
                  <p className="text-red-400 text-sm arabic-text" id="issuingBank-error">
                    {errors.issuingBank.message}
                  </p>
                )}
              </div>

              {/* Employee and Signature Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-cyan-300 arabic-text border-b border-white/20 pb-2">
                  بيانات الموظف مستلم الشيك
                </h3>
                
                {/* Employee Name */}
                <div className="space-y-2">
                  <label 
                    htmlFor="employeeName" 
                    className="block text-sm font-medium text-cyan-300 arabic-text"
                  >
                    اسم الموظف *
                  </label>
                  <div className="relative">
                    <select
                      id="employeeName"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm appearance-none"
                      aria-describedby="employeeName-error"
                      {...register('employeeName', { required: 'اسم الموظف مطلوب' })}
                    >
                      <option value="" className="bg-slate-800 text-white">اختر الموظف</option>
                      {employeeNames.map((name, index) => (
                        <option key={index} value={name} className="bg-slate-800 text-white">
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.employeeName && (
                    <p className="text-red-400 text-sm arabic-text" id="employeeName-error">
                      {errors.employeeName.message}
                    </p>
                  )}
                </div>

                {/* Signature Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-cyan-300 arabic-text">
                    التوقيع *
                  </label>
                  
                  {/* Signature Canvas */}
                  <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="bg-white rounded-lg p-2 mb-4 shadow-lg">
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          className: "w-full h-32 border border-gray-300 rounded-lg cursor-crosshair",
                          style: { backgroundColor: 'white' }
                        }}
                        onEnd={handleSignatureEnd}
                        penColor="#1f2937"
                        backgroundColor="white"
                        velocityFilterWeight={0.7}
                        minWidth={2}
                        maxWidth={3}
                      />
                    </div>
                    
                    {/* Signature Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-300 arabic-text transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        مسح التوقيع
                      </button>
                      
                      {!isSignatureEmpty && (
                        <div className="flex items-center gap-2 text-green-400 text-sm arabic-text bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          تم التوقيع بنجاح
                        </div>
                      )}
                      
                      {isSignatureEmpty && (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm arabic-text bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          يرجى التوقيع في المنطقة أعلاه
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Typed Name Fallback */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="typedName" 
                      className="block text-sm font-medium text-cyan-300 arabic-text"
                    >
                      الاسم المطبوع (اختياري)
                    </label>
                    <input
                      type="text"
                      id="typedName"
                      placeholder="أدخل الاسم المطبوع كبديل للتوقيع"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
                      {...register('typedName')}
                    />
                    <p className="text-xs text-gray-400 arabic-text">
                      يمكن استخدام الاسم المطبوع كبديل للتوقيع اليدوي
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 arabic-text btn-hover"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    معاينة
                  </span>
                </button>
                
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 arabic-text btn-hover"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    تسجيل الإيصال
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={onReset}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 arabic-text backdrop-blur-sm btn-hover"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    إعادة تعيين
                  </span>
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-400 arabic-text">
                جميع البيانات محمية ومشفرة وفقاً لأعلى معايير الأمان
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formData={getValues()}
      />

      {/* Submit Flow Modal */}
      <SubmitFlowModal
        isOpen={isSubmitFlowOpen}
        onClose={() => setIsSubmitFlowOpen(false)}
        onNewRegistration={handleNewRegistration}
        formData={getValues()}
        isEmployeePage={true}
      />
    </div>
  );
}
