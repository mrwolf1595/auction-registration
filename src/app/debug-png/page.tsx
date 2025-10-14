'use client';

import { useState } from 'react';
import { generateRobustReceiptPDF, generateRobustDeclarationPDF } from '@/lib/robustPdfGenerator';

export default function DebugPNGPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; blob?: Blob; method?: string; fallbackUsed?: boolean } | null>(null);

  const sampleFormData = {
    bidderName: 'أحمد محمد العتيبي',
    idNumber: '1234567890',
    phoneNumber: '0501234567',
    issuingBank: 'البنك الأهلي السعودي',
    cheques: [
      { number: '123456', amount: '100000' },
      { number: '789012', amount: '50000' }
    ],
    checkCount: '2',
    employeeName: 'أحمد',
    signature: '',
    typedName: 'أحمد محمد العتيبي'
  };

  const handleTestReceipt = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      console.log('Starting Receipt PDF generation...');
      const pdfResult = await generateRobustReceiptPDF(sampleFormData);
      console.log('Receipt PDF generation successful:', pdfResult);
      setResult({ 
        success: pdfResult.success, 
        blob: pdfResult.blob,
        method: pdfResult.method,
        fallbackUsed: pdfResult.fallbackUsed,
        error: pdfResult.error
      });
    } catch (error) {
      console.error('Receipt PDF generation error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestDeclaration = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      console.log('Starting Declaration PDF generation...');
      const pdfResult = await generateRobustDeclarationPDF(sampleFormData);
      console.log('Declaration PDF generation successful:', pdfResult);
      setResult({ 
        success: pdfResult.success, 
        blob: pdfResult.blob,
        method: pdfResult.method,
        fallbackUsed: pdfResult.fallbackUsed,
        error: pdfResult.error
      });
    } catch (error) {
      console.error('Declaration PDF generation error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result?.success && result.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug_${result.method || 'pdf'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent arabic-text mb-4">
            اختبار نظام PDF المحسن
          </h1>
          <p className="text-gray-300 arabic-text text-lg">
            اختبار إنشاء ملفات PDF باستخدام robustPdfGenerator مع ضغط الصور
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleTestReceipt}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 arabic-text font-semibold"
              >
                {isGenerating ? 'جاري الاختبار...' : 'اختبار الإيصال (للموظف)'}
              </button>
              
              <button
                onClick={handleTestDeclaration}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 arabic-text font-semibold"
              >
                {isGenerating ? 'جاري الاختبار...' : 'اختبار الإقرار (للعميل)'}
              </button>
            </div>

            {result && (
              <div className="mt-6 p-4 rounded-lg border">
                {result.success ? (
                  <div className="text-green-400">
                    <p className="font-semibold">✅ PDF generated successfully!</p>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>File size: {result.blob?.size} bytes</p>
                      <p>Method: {result.method}</p>
                      <p>Fallback used: {result.fallbackUsed ? 'Yes' : 'No'}</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      تحميل الملف
                    </button>
                  </div>
                ) : (
                  <div className="text-red-400">
                    <p className="font-semibold">❌ PDF generation failed</p>
                    <p className="text-sm text-gray-300">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Debug Information:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Check browser console for detailed logs</p>
                <p>• Verify image paths are correct</p>
                <p>• Check html2canvas configuration</p>
                <p>• Verify Arabic text rendering in PNG</p>
                <p>• Check PNG to PDF conversion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
