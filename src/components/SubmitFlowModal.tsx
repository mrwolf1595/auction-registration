'use client';

import React, { useState } from 'react';
import { ValidatedFormData } from '@/lib/validation';
import { useSubmitFlow } from '@/hooks/useSubmitFlow';
import { 
  generateRobustReceiptPDF, 
  generateRobustDeclarationPDF,
  convertPNGToPDF,
  generateReceiptPNG,
  generateDeclarationPNG
} from '@/lib/robustPdfGenerator';

interface SubmitFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewRegistration: () => void;
  formData: ValidatedFormData;
  isEmployeePage?: boolean;
  bidderNumber?: number;
}

export default function SubmitFlowModal({ 
  isOpen, 
  onClose, 
  onNewRegistration, 
  formData,
  isEmployeePage = false,
  bidderNumber
}: SubmitFlowModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const submitFlow = useSubmitFlow();

  const handleStartSubmission = async () => {
    if (submitFlow.isSubmitting) {
      console.log('Already submitting, skipping duplicate request');
      return;
    }
    setShowPreview(false);
    await submitFlow.submitForm(formData, isEmployeePage, bidderNumber);
  };

  // دالة جديدة لاستخدام convertPNGToPDF مباشرة
  const handleDirectPNGToPDF = async () => {
    try {
      console.log('Starting direct PNG to PDF conversion...');
      console.log('🔍 formData keys:', Object.keys(formData));
      console.log('🔍 Signature in formData:', formData.signature ? 'Yes ✅' : 'No ❌');
      console.log('🔍 Signature length:', formData.signature?.length || 0);
      if (formData.signature) {
        console.log('🔍 Signature preview:', formData.signature.substring(0, 100));
      }
      
      let pngResult;
      if (isEmployeePage) {
        // إنشاء PNG للإيصال
        pngResult = await generateReceiptPNG(formData, bidderNumber);
      } else {
        // إنشاء PNG للإقرار
        pngResult = await generateDeclarationPNG(formData, bidderNumber);
      }
      
      console.log('PNG generated successfully, converting to PDF...');
      
      // تحويل PNG إلى PDF باستخدام convertPNGToPDF
      const pdfResult = await convertPNGToPDF(pngResult.blob);
      
      console.log('PDF conversion completed successfully');
      
      // تحميل الملف مباشرة
      const url = URL.createObjectURL(pdfResult.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isEmployeePage ? 'receipt.pdf' : 'declaration.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully');
      
    } catch (error) {
      console.error('Direct PNG to PDF conversion error:', error);
      alert('حدث خطأ في تحويل الصورة إلى PDF');
    }
  };

  // Start submission immediately when modal opens
  React.useEffect(() => {
    if (isOpen && submitFlow.currentStep === 'idle') {
      handleStartSubmission();
    }
  }, [isOpen, submitFlow.currentStep]);

  if (!isOpen) return null;

  const handleRetry = async () => {
    await submitFlow.retrySubmission();
  };

  const handleNewRegistration = () => {
    submitFlow.resetFlow();
    onNewRegistration();
    onClose();
  };

  const getStepTitle = () => {
    switch (submitFlow.currentStep) {
      case 'validating':
        return 'جاري التحقق من البيانات...';
      case 'generating':
        return 'جاري إنشاء ملفات PDF...';
      case 'uploading':
        return 'جاري رفع الملفات...';
      case 'saving':
        return 'جاري حفظ البيانات...';
      case 'success':
        return 'تم التسجيل بنجاح!';
      case 'error':
        return 'حدث خطأ';
      default:
        return 'تأكيد التسجيل';
    }
  };

  const getStepDescription = () => {
    switch (submitFlow.currentStep) {
      case 'validating':
        return 'نحن نتحقق من صحة البيانات المدخلة';
      case 'generating':
        return 'نحن ننشئ ملفات PDF للوثائق المطلوبة';
      case 'uploading':
        return 'نحن نرفع الملفات إلى التخزين السحابي';
      case 'saving':
        return 'نحن نحفظ البيانات في قاعدة البيانات';
      case 'success':
        return 'تم تسجيل بياناتك بنجاح وتم إنشاء جميع الوثائق المطلوبة';
      case 'error':
        return submitFlow.error || 'حدث خطأ غير متوقع';
      default:
        return 'يرجى مراجعة البيانات قبل المتابعة';
    }
  };

  const renderStepIcon = () => {
    const baseClasses = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500";
    
    switch (submitFlow.currentStep) {
      case 'validating':
      case 'generating':
      case 'uploading':
      case 'saving':
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-cyan-500 to-blue-500`}>
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-red-500 to-pink-500`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gradient-to-r from-purple-500 to-indigo-500`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (showPreview && submitFlow.currentStep === 'idle') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white arabic-text mb-2">
              تأكيد البيانات
            </h3>
            <p className="text-gray-300 arabic-text">
              يرجى مراجعة البيانات التالية قبل المتابعة
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300 arabic-text">اسم المزايد:</span>
              <span className="text-white arabic-text font-medium">{formData.bidderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 arabic-text">رقم الهوية:</span>
              <span className="text-white arabic-text font-medium">{formData.idNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 arabic-text">عدد الشيكات:</span>
              <span className="text-white arabic-text font-medium">{formData.cheques.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 arabic-text">الموظف المسؤول:</span>
              <span className="text-white arabic-text font-medium">{formData.employeeName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartSubmission}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold"
            >
              تأكيد والتسجيل (النظام العادي)
            </button>
            <button
              onClick={handleDirectPNGToPDF}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold"
            >
              تحويل PNG إلى PDF مباشرة
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 arabic-text"
            >
              إلغاء
            </button>
          </div>
        </div>
      );
    }

    if (submitFlow.currentStep === 'success' && submitFlow.successData) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-400 arabic-text mb-2">
              تم التسجيل بنجاح! 🎉
            </h3>
            <p className="text-gray-300 arabic-text">
              تم إنشاء الإقرار بنجاح، يمكنك طباعته الآن
              {!submitFlow.successData.firestoreError ? " وتم حفظ جميع البيانات" : ""}
            </p>
            
            {submitFlow.successData.firestoreError && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 arabic-text text-sm">
                  تم إنشاء الإقرار لكن هناك مشكلة في حفظ البيانات للمراجعة لاحقاً. 
                  يرجى تحميل الإقرار وإحضاره معك للموظف.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
            <div className="text-center">
              <p className="text-green-300 arabic-text font-semibold text-lg">
                رقم التسجيل: {submitFlow.successData.registrationNumber}
              </p>
              <p className="text-sm text-gray-400 arabic-text">
                معرّف المستند: {submitFlow.successData.docId}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white arabic-text font-semibold">الملفات المتاحة للتحميل:</h4>
              
              <div className="flex flex-col gap-3">
                {/* زر طباعة الإقرار - مبرز وواضح */}
                <a
                  href={submitFlow.successData.declarationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 hover:to-indigo-500/40 rounded-lg transition-colors duration-300 border border-purple-500/30"
                  onClick={() => {
                    // Try to trigger print dialog after opening
                    setTimeout(() => {
                      window.open(submitFlow.successData!.declarationUrl, '_blank')?.print();
                    }, 1000);
                  }}
                >
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="text-white arabic-text font-semibold">طباعة إقرار المزايد</span>
                  <span className="bg-green-500/30 px-2 py-1 rounded-md text-xs text-green-300 ml-auto">مطلوب</span>
                </a>

                {/* رابط إيصال الاستلام - ثانوي */}
                <a
                  href={submitFlow.successData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-300"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-white arabic-text">إيصال الاستلام</span>
                  <span className="bg-yellow-500/30 px-2 py-1 rounded-md text-xs text-yellow-300 ml-auto">للموظف فقط</span>
                </a>
              </div>
            </div>
          </div>

          {/* تعليمات الخطوات التالية */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-300 font-semibold arabic-text mb-2">الخطوات التالية:</h4>
            <ol className="list-decimal list-inside text-gray-300 arabic-text space-y-2 text-sm">
              <li>قم بطباعة إقرار المزايد الآن</li>
              <li>أحضر الإقرار المطبوع مع الشيكات إلى مقر المزاد</li>
              <li>سيقوم الموظف بمراجعة الإقرار والشيكات</li>
              <li>عند الموافقة سيتم تسليمك إيصال الاستلام</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            
            <div className="flex gap-3">
              <button
                onClick={handleNewRegistration}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold"
              >
                تسجيل جديد
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 arabic-text"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (submitFlow.currentStep === 'error') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-400 arabic-text mb-2">
              حدث خطأ
            </h3>
            <p className="text-gray-300 arabic-text">
              {submitFlow.error}
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-300 arabic-text text-sm">
              يرجى المحاولة مرة أخرى. إذا استمر الخطأ، يرجى التواصل مع الدعم الفني.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 arabic-text"
            >
              إلغاء
            </button>
          </div>
        </div>
      );
    }

    // Loading states
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white arabic-text mb-2">
            {getStepTitle()}
          </h3>
          <p className="text-gray-300 arabic-text">
            {getStepDescription()}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            {renderStepIcon()}
          </div>

          {submitFlow.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400 arabic-text">
                <span>التقدم</span>
                <span>{submitFlow.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${submitFlow.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400 arabic-text">
            يرجى عدم إغلاق هذه النافذة أثناء المعالجة
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={submitFlow.currentStep === 'idle' ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
