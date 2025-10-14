'use client';

import { useState } from 'react';
import { ValidatedFormData } from '@/lib/validation';
import { generateReceiptPDF, generateReceiptPNG, generateBidderDeclarationPDF, downloadFile } from '@/lib/pdfGenerator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { saveRegistrationToFirestore, generateUniqueRegistrationNumber as generateRegNumber } from '@/lib/firestoreUtils';
import UploadProgress from './UploadProgress';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ValidatedFormData;
}

// Utility function to format numbers with thousand separators
const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Utility function to parse formatted number
const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

export default function PreviewModal({ isOpen, onClose, formData }: PreviewModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  const [isGeneratingDeclaration, setIsGeneratingDeclaration] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [firestoreDocId, setFirestoreDocId] = useState<string | null>(null);
  
  const { uploadState, uploadFiles, resetUploadState } = useFileUpload();

  if (!isOpen) return null;

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { blob } = await generateReceiptPDF(formData);
      downloadFile(blob, 'ايصال_استلام.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('فشل في إنشاء ملف PDF. سيتم إنشاء ملف PDF بديل.');
      // Try PDF fallback
      try {
        const { blob } = await generateReceiptPNG();
        downloadFile(blob, 'ايصال_استلام.pdf');
      } catch (pdfError) {
        console.error('PDF generation also failed:', pdfError);
        alert('فشل في إنشاء الملف. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGeneratePNG = async () => {
    setIsGeneratingPNG(true);
    try {
      const { blob } = await generateReceiptPNG();
      downloadFile(blob, 'ايصال_استلام.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('فشل في إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  const handleGenerateDeclaration = async () => {
    setIsGeneratingDeclaration(true);
    try {
      const { blob } = await generateBidderDeclarationPDF(formData);
      downloadFile(blob, 'اقرار_المزايد.pdf');
    } catch (error) {
      console.error('Declaration PDF generation failed:', error);
      alert('فشل في إنشاء إقرار المزايد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingDeclaration(false);
    }
  };

  const handleUploadToFirebase = async () => {
    try {
      setShowUploadProgress(true);
      resetUploadState();
      
      // Generate both PDFs
      const [receiptResult, declarationResult] = await Promise.all([
        generateReceiptPDF(formData),
        generateBidderDeclarationPDF(formData)
      ]);
      
      // Upload to Firebase Storage
      const uploadResult = await uploadFiles(
        formData,
        receiptResult.blob,
        declarationResult.blob
      );
      
      if (uploadResult.success) {
        console.log('Files uploaded successfully:', {
          receiptUrl: uploadResult.receiptUrl,
          declarationUrl: uploadResult.declarationUrl
        });
      } else {
        console.error('Upload failed:', uploadResult.errors);
      }
    } catch (error) {
      console.error('Upload process failed:', error);
    }
  };

  const handleSaveToFirestore = async () => {
    try {
      setIsSavingToFirestore(true);
      
      // Generate unique registration number
      const registrationNumber = generateRegNumber();
      
      // Save to Firestore
      const result = await saveRegistrationToFirestore(
        formData,
        registrationNumber,
        {} // PDF URLs will be empty initially
      );
      
      if (result.success && result.docId) {
        setFirestoreDocId(result.docId);
        alert(`✅ تم حفظ البيانات بنجاح!\nرقم التسجيل: ${registrationNumber}\nمعرف المستند: ${result.docId}`);
      } else {
        alert(`❌ فشل في حفظ البيانات: ${result.error}`);
      }
    } catch (error) {
      console.error('Firestore save failed:', error);
      alert('❌ حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleCloseUploadProgress = () => {
    setShowUploadProgress(false);
    resetUploadState();
  };

  // Calculate total amount
  const totalAmount = formData.cheques.reduce((sum, cheque) => {
    return sum + parseNumber(cheque.amount || '0');
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div 
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl"
          data-preview-modal
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent arabic-text">
              معاينة البيانات
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-8">
              {/* Bidder Information */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text border-b border-white/20 pb-2">
                  بيانات المزايد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      اسم المزايد
                    </label>
                    <p className="text-white arabic-text font-medium">{formData.bidderName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      رقم الهوية
                    </label>
                    <p className="text-white arabic-text font-medium">{formData.idNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      رقم الجوال
                    </label>
                    <p className="text-white arabic-text font-medium">{formData.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      البنك المصدر
                    </label>
                    <p className="text-white arabic-text font-medium">{formData.issuingBank}</p>
                  </div>
                </div>
              </div>

              {/* Cheques Information */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text border-b border-white/20 pb-2">
                  تفاصيل الشيكات
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right arabic-text">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-cyan-300 font-semibold py-3 px-4">رقم الشيك</th>
                        <th className="text-cyan-300 font-semibold py-3 px-4">المبلغ (ريال سعودي)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.cheques.map((cheque, index) => (
                        <tr key={index} className="border-b border-white/10">
                          <td className="text-white py-3 px-4 font-medium">{cheque.number}</td>
                          <td className="text-white py-3 px-4 font-medium">
                            {formatNumber(cheque.amount)} ريال
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-cyan-500/30">
                        <td className="text-cyan-300 font-bold py-3 px-4">المجموع الكلي</td>
                        <td className="text-cyan-300 font-bold py-3 px-4 text-lg">
                          {formatNumber(totalAmount.toString())} ريال سعودي
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Employee and Signature */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text border-b border-white/20 pb-2">
                  بيانات الموظف والتوقيع
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      اسم الموظف
                    </label>
                    <p className="text-white arabic-text font-medium">{formData.employeeName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 arabic-text mb-1">
                      التوقيع
                    </label>
                    {formData.signature ? (
                      <div className="bg-white rounded-lg p-2 border border-gray-300">
                        <img 
                          src={formData.signature} 
                          alt="توقيع الموظف" 
                          className="w-full h-20 object-contain"
                        />
                      </div>
                    ) : formData.typedName ? (
                      <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <p className="text-white arabic-text font-medium">{formData.typedName}</p>
                        <p className="text-xs text-gray-400 arabic-text mt-1">الاسم المطبوع</p>
                      </div>
                    ) : (
                      <p className="text-gray-400 arabic-text">لم يتم التوقيع</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="backdrop-blur-sm bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text">
                  ملخص الطلب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-2xl font-bold text-white">{formData.cheques.length}</p>
                    <p className="text-cyan-300 arabic-text">عدد الشيكات</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(totalAmount.toString())}
                    </p>
                    <p className="text-cyan-300 arabic-text">المجموع الكلي (ريال)</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-2xl font-bold text-white">{formData.employeeName}</p>
                    <p className="text-cyan-300 arabic-text">الموظف المسؤول</p>
                  </div>
                </div>
              </div>

              {/* Firestore Status */}
              {firestoreDocId && (
                <div className="backdrop-blur-sm bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-300 mb-4 arabic-text">
                    ✅ تم حفظ البيانات في Firestore
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white arabic-text">
                      <span className="text-green-300 font-semibold">معرف المستند:</span> {firestoreDocId}
                    </p>
                    <p className="text-sm text-gray-300 arabic-text mt-2">
                      يمكنك الآن عرض البيانات في Firebase Console
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-white/20 gap-4">
            <p className="text-sm text-gray-400 arabic-text">
              هذه معاينة للبيانات التي سيتم إرسالها
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    إيصال PDF
                  </>
                )}
              </button>
              
              <button
                onClick={handleGenerateDeclaration}
                disabled={isGeneratingDeclaration}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingDeclaration ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    إقرار PDF
                  </>
                )}
              </button>
              
              <button
                onClick={handleGeneratePNG}
                disabled={isGeneratingPNG}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingPNG ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    تحميل PNG
                  </>
                )}
              </button>
              
              <button
                onClick={handleSaveToFirestore}
                disabled={isSavingToFirestore}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingToFirestore ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    حفظ في Firestore
                  </>
                )}
              </button>
              
              <button
                onClick={handleUploadToFirebase}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                رفع إلى Firebase
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 arabic-text"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      {showUploadProgress && (
        <UploadProgress
          uploadState={uploadState}
          onClose={handleCloseUploadProgress}
        />
      )}
    </div>
  );
}
