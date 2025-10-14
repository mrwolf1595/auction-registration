import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  UploadTaskSnapshot,
  StorageError 
} from 'firebase/storage';
import { storage } from './firebase';
import { ValidatedFormData } from './validation';

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Upload result type
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName: string;
}

// Generate storage path based on bidder name and date
const generateStoragePath = (bidderName: string, fileName: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
  const sanitizedName = bidderName.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').replace(/\s+/g, '_');
  
  return `مزادات/${sanitizedName}/${dateStr}/${fileName}`;
};

// Upload file to Firebase Storage with progress tracking
export const uploadFileToStorage = async (
  file: Blob,
  fileName: string,
  bidderName: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  try {
    // Check if Firebase Storage is available
    if (!storage) {
      throw new Error('Firebase Storage is not configured. Please check your environment variables.');
    }

    // Generate storage path
    const storagePath = generateStoragePath(bidderName, fileName);
    const storageRef = ref(storage, storagePath);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error: StorageError) => {
          console.error('Upload error:', error);
          resolve({
            success: false,
            error: `فشل في رفع الملف: ${error.message}`,
            fileName
          });
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              fileName
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            resolve({
              success: false,
              error: 'فشل في الحصول على رابط التحميل',
              fileName
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    return {
      success: false,
      error: 'فشل في بدء عملية الرفع',
      fileName
    };
  }
};

// Upload both receipt and declaration PDFs
export const uploadBidderDocuments = async (
  formData: ValidatedFormData,
  receiptBlob: Blob,
  declarationBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<{
  success: boolean;
  receiptUrl?: string;
  declarationUrl?: string;
  errors: string[];
}> => {
  const errors: string[] = [];
  let receiptUrl: string | undefined;
  let declarationUrl: string | undefined;
  
  try {
    // Upload receipt PDF
    const receiptResult = await uploadFileToStorage(
      receiptBlob,
      'ايصال_استلام.pdf',
      formData.bidderName,
      (progress) => {
        // Report progress for receipt (0-50%)
        onProgress?.(progress * 0.5);
      }
    );
    
    if (receiptResult.success) {
      receiptUrl = receiptResult.url;
    } else {
      errors.push(`إيصال الاستلام: ${receiptResult.error}`);
    }
    
    // Upload declaration PDF
    const declarationResult = await uploadFileToStorage(
      declarationBlob,
      'اقرار_المزايد.pdf',
      formData.bidderName,
      (progress) => {
        // Report progress for declaration (50-100%)
        onProgress?.(50 + (progress * 0.5));
      }
    );
    
    if (declarationResult.success) {
      declarationUrl = declarationResult.url;
    } else {
      errors.push(`إقرار المزايد: ${declarationResult.error}`);
    }
    
    return {
      success: errors.length === 0,
      receiptUrl,
      declarationUrl,
      errors
    };
  } catch (error) {
    console.error('Upload process error:', error);
    errors.push('فشل في عملية الرفع العامة');
    return {
      success: false,
      errors
    };
  }
};

// Upload single file (for PNG fallback)
export const uploadSingleFile = async (
  file: Blob,
  fileName: string,
  bidderName: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  return uploadFileToStorage(file, fileName, bidderName, onProgress);
};

// Generate public download URLs (alternative to signed URLs)
export const getPublicDownloadURL = async (storagePath: string): Promise<string> => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not configured');
    }
    
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting public download URL:', error);
    throw new Error('فشل في الحصول على رابط التحميل');
  }
};

// Utility to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility to get file extension
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

// Utility to validate file type
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(fileName);
  return allowedTypes.includes(extension);
};
