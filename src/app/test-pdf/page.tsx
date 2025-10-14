'use client';

import { useState } from 'react';
import { generateReceiptPDFFromPNG, generateDeclarationPDFFromPNG } from '@/lib/pngToPdfSystem';
import { downloadFile } from '@/lib/pdfGenerator';

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<{
    receipt?: { success: boolean; method: string; fallbackUsed: boolean; error?: string };
    declaration?: { success: boolean; method: string; fallbackUsed: boolean; error?: string };
  }>({});

  // Sample test data
  const sampleFormData = {
    bidderName: 'أحمد محمد العتيبي',
    idNumber: '1234567890',
    phoneNumber: '0501234567',
    checkCount: '2',
    issuingBank: 'البنك الأهلي السعودي',
    cheques: [
      { number: 'CHK001', amount: '50000' },
      { number: 'CHK002', amount: '30000' }
    ],
    employeeName: 'أحمد',
    signature: '',
    typedName: 'أحمد محمد العتيبي'
  };

  const handleTestReceipt = async () => {
    setIsGenerating(true);
    try {
      const result = await generateReceiptPDFFromPNG(sampleFormData);
      setTestResults(prev => ({ ...prev, receipt: { success: true, method: 'png-to-pdf', fallbackUsed: false, blob: result.blob } }));
    } catch (error) {
      console.error('Receipt test error:', error);
      setTestResults(prev => ({ ...prev, receipt: { success: false, method: 'png-to-pdf', fallbackUsed: false, error: error instanceof Error ? error.message : 'فشل في إنشاء الملف' } }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestDeclaration = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDeclarationPDFFromPNG(sampleFormData);
      setTestResults(prev => ({ ...prev, declaration: { success: true, method: 'png-to-pdf', fallbackUsed: false, blob: result.blob } }));
    } catch (error) {
      console.error('Declaration test error:', error);
      setTestResults(prev => ({ ...prev, declaration: { success: false, method: 'png-to-pdf', fallbackUsed: false, error: error instanceof Error ? error.message : 'فشل في إنشاء الملف' } }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (result: { success: boolean; blob?: Blob }, filename: string) => {
    if (result.success && result.blob) {
      downloadFile(result.blob, filename);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent arabic-text mb-4">
            اختبار إنشاء ملفات PDF من PNG
          </h1>
          <p className="text-gray-300 arabic-text text-lg">
            اختبار نظام إنشاء ملفات PDF من PNG مع النص العربي الواضح
          </p>
        </div>

        {/* Arabic Text Samples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sample Text Display */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-cyan-300 arabic-text mb-4">
              عينات النصوص العربية
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white arabic-text mb-2">نص عادي</h3>
                <p className="text-gray-300 arabic-text">
                  هذا نص تجريبي لاختبار عرض الخطوط العربية بشكل صحيح في ملفات PDF
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white arabic-text mb-2">نص مختلط</h3>
                <p className="text-gray-300 arabic-text">
                  هذا نص يحتوي على أرقام 1234567890 ونص إنجليزي English Text
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white arabic-text mb-2">أرقام عربية</h3>
                <p className="text-gray-300 arabic-text">
                  الأرقام العربية: {arabicUtils.formatArabicNumber(1234567890)}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white arabic-text mb-2">عملة عربية</h3>
                <p className="text-gray-300 arabic-text">
                  المبلغ: {arabicUtils.formatArabicCurrency(50000)}
                </p>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-cyan-300 arabic-text mb-4">
              اختبارات إنشاء PDF
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleTestReceipt}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'جاري الاختبار...' : 'اختبار إيصال الاستلام'}
              </button>
              
              <button
                onClick={handleTestDeclaration}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 arabic-text font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'جاري الاختبار...' : 'اختبار إقرار المزايد'}
              </button>
            </div>

            {/* Test Data Display */}
            <div className="mt-6 bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white arabic-text mb-3">
                بيانات الاختبار
              </h3>
              <div className="space-y-2 text-sm text-gray-300 arabic-text">
                <p><span className="text-cyan-300">الاسم:</span> {sampleFormData.bidderName}</p>
                <p><span className="text-cyan-300">الهوية:</span> {sampleFormData.idNumber}</p>
                <p><span className="text-cyan-300">الجوال:</span> {sampleFormData.phoneNumber}</p>
                <p><span className="text-cyan-300">البنك:</span> {sampleFormData.issuingBank}</p>
                <p><span className="text-cyan-300">عدد الشيكات:</span> {sampleFormData.cheques.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {(testResults.receipt || testResults.declaration) && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-cyan-300 arabic-text mb-4">
              نتائج الاختبار
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receipt Results */}
              {testResults.receipt && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white arabic-text mb-3">
                    إيصال الاستلام
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${testResults.receipt.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-300 arabic-text">
                        {testResults.receipt.success ? 'نجح الاختبار' : 'فشل الاختبار'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 arabic-text">
                      <p><span className="text-cyan-300">الطريقة:</span> {testResults.receipt.method}</p>
                      <p><span className="text-cyan-300">النسخ الاحتياطي:</span> {testResults.receipt.fallbackUsed ? 'نعم' : 'لا'}</p>
                      {testResults.receipt.error && (
                        <p><span className="text-red-300">الخطأ:</span> {testResults.receipt.error}</p>
                      )}
                    </div>
                    
                    {testResults.receipt.success && (
                      <button
                        onClick={() => handleDownload(testResults.receipt!, 'test_receipt.pdf')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 arabic-text"
                      >
                        تحميل الملف
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Declaration Results */}
              {testResults.declaration && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white arabic-text mb-3">
                    إقرار المزايد
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${testResults.declaration.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-300 arabic-text">
                        {testResults.declaration.success ? 'نجح الاختبار' : 'فشل الاختبار'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 arabic-text">
                      <p><span className="text-cyan-300">الطريقة:</span> {testResults.declaration.method}</p>
                      <p><span className="text-cyan-300">النسخ الاحتياطي:</span> {testResults.declaration.fallbackUsed ? 'نعم' : 'لا'}</p>
                      {testResults.declaration.error && (
                        <p><span className="text-red-300">الخطأ:</span> {testResults.declaration.error}</p>
                      )}
                    </div>
                    
                    {testResults.declaration.success && (
                      <button
                        onClick={() => handleDownload(testResults.declaration!, 'test_declaration.pdf')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 arabic-text"
                      >
                        تحميل الملف
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Font Information */}
        <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h2 className="text-2xl font-semibold text-cyan-300 arabic-text mb-4">
            معلومات الخطوط
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white arabic-text mb-3">
                خط Tajawal
              </h3>
              <p className="text-gray-300 arabic-text text-sm mb-2">
                خط عربي حديث مصمم خصيصاً للعرض الرقمي
              </p>
              <p className="text-gray-400 text-xs">
                المصدر: Google Fonts
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white arabic-text mb-3">
                خط Cairo
              </h3>
              <p className="text-gray-300 arabic-text text-sm mb-2">
                خط عربي كلاسيكي مناسب للوثائق الرسمية
              </p>
              <p className="text-gray-400 text-xs">
                المصدر: Google Fonts
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h2 className="text-2xl font-semibold text-cyan-300 arabic-text mb-4">
            تعليمات الاختبار
          </h2>
          
          <div className="space-y-3 text-gray-300 arabic-text">
            <p>1. اضغط على &quot;اختبار إيصال الاستلام&quot; لاختبار إنشاء ملف PDF للإيصال</p>
            <p>2. اضغط على &quot;اختبار إقرار المزايد&quot; لاختبار إنشاء ملف PDF للإقرار</p>
            <p>3. تحقق من جودة النص العربي في الملفات المحملة</p>
            <p>4. الملفات تُنشأ كـ PDF من PNG مع نص عربي واضح</p>
            <p>5. يمكن طباعة الملفات بسهولة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
