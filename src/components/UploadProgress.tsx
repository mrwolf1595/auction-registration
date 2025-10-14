'use client';

import { UploadState } from '@/hooks/useFileUpload';

interface UploadProgressProps {
  uploadState: UploadState;
  onClose: () => void;
}

export default function UploadProgress({ uploadState, onClose }: UploadProgressProps) {
  const { isUploading, progress, isComplete, receiptUrl, declarationUrl, errors } = uploadState;

  if (!isUploading && !isComplete && errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent arabic-text">
              رفع الملفات
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-white arabic-text">جاري رفع الملفات...</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-cyan-300 text-sm arabic-text">
                    {Math.round(progress)}% مكتمل
                  </span>
                </div>
              </div>
            )}

            {/* Success State */}
            {isComplete && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white arabic-text">تم رفع الملفات بنجاح!</span>
                </div>
                
                {/* Download Links */}
                <div className="space-y-3">
                  {receiptUrl && (
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 arabic-text text-sm">إيصال الاستلام</span>
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          تحميل
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {declarationUrl && (
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 arabic-text text-sm">إقرار المزايد</span>
                        <a
                          href={declarationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          تحميل
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {errors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-white arabic-text">فشل في رفع الملفات</span>
                </div>
                
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="text-red-400 text-sm arabic-text bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 arabic-text"
            >
              {isComplete ? 'إغلاق' : 'إلغاء'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
