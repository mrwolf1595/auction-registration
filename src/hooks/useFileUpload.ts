import { useState, useCallback } from 'react';
import { ValidatedFormData } from '@/lib/validation';
import { uploadBidderDocuments } from '@/lib/storageUtils';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  isComplete: boolean;
  receiptUrl?: string;
  declarationUrl?: string;
  errors: string[];
}

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    isComplete: false,
    errors: []
  });

  const uploadFiles = useCallback(async (
    formData: ValidatedFormData,
    receiptBlob: Blob,
    declarationBlob: Blob
  ) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      isComplete: false,
      errors: []
    });

    try {
      const result = await uploadBidderDocuments(
        formData,
        receiptBlob,
        declarationBlob,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setUploadState({
        isUploading: false,
        progress: 100,
        isComplete: result.success,
        receiptUrl: result.receiptUrl,
        declarationUrl: result.declarationUrl,
        errors: result.errors
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        isComplete: false,
        errors: ['فشل في عملية الرفع']
      });
      
      return {
        success: false,
        errors: ['فشل في عملية الرفع']
      };
    }
  }, []);

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      isComplete: false,
      errors: []
    });
  }, []);

  return {
    uploadState,
    uploadFiles,
    resetUploadState
  };
};
