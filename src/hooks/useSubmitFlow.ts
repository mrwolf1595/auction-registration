import { useState, useCallback } from 'react';
import { ValidatedFormData } from '@/lib/validation';
import { generateRobustReceiptPDF, generateRobustDeclarationPDF } from '@/lib/robustPdfGenerator';
import { generateUniqueRegistrationNumber } from '@/lib/firestoreUtils';

export interface SubmitFlowState {
  isSubmitting: boolean;
  currentStep: 'idle' | 'validating' | 'generating' | 'uploading' | 'saving' | 'success' | 'error';
  progress: number;
  error: string | null;
  successData: {
    docId: string;
    registrationNumber: number;
    receiptUrl: string;
    declarationUrl: string;
    firestoreError?: string | null;
  } | null;
}

export interface SubmitFlowActions {
  submitForm: (formData: ValidatedFormData, isEmployeePage?: boolean, bidderNumber?: number) => Promise<void>;
  retrySubmission: () => Promise<void>;
  resetFlow: () => void;
}

export function useSubmitFlow(): SubmitFlowState & SubmitFlowActions {
  const [state, setState] = useState<SubmitFlowState>({
    isSubmitting: false,
    currentStep: 'idle',
    progress: 0,
    error: null,
    successData: null
  });

  const [lastFormData, setLastFormData] = useState<ValidatedFormData | null>(null);
  const [lastIsEmployeePage, setLastIsEmployeePage] = useState<boolean>(false);

  const updateState = useCallback((updates: Partial<SubmitFlowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const submitForm = useCallback(async (formData: ValidatedFormData, isEmployeePage: boolean = false, bidderNumber?: number) => {
    // Prevent double submission
    if (state.isSubmitting) {
      console.log('Already submitting, skipping duplicate request');
      return;
    }
    
    try {
      setLastFormData(formData);
      setLastIsEmployeePage(isEmployeePage);
      updateState({
        isSubmitting: true,
        currentStep: 'validating',
        progress: 0,
        error: null,
        successData: null
      });

      // Skip authentication for client registration - we don't need it
      console.log("Skipping authentication for client registration");

      // Step 1: Validation (already done by form)
      updateState({
        currentStep: 'generating',
        progress: 20
      });

      // Step 2: Generate PDF using robust generator with bidderNumber
      console.log('🔍 Generating PDF with formData keys:', Object.keys(formData));
      console.log('🔍 Signature in formData:', formData.signature ? 'Yes ✅' : 'No ❌');
      console.log('🔍 Signature length:', formData.signature?.length || 0);
      
      let receiptResult, declarationResult;
      
      if (isEmployeePage) {
        // For employee page: generate receipt PDF with bidderNumber
        const pdfResult = await generateRobustReceiptPDF(formData, bidderNumber);
        receiptResult = { success: pdfResult.success, blob: pdfResult.blob, method: pdfResult.method, fallbackUsed: pdfResult.fallbackUsed };
        declarationResult = { success: true, blob: new Blob(), method: 'jspdf', fallbackUsed: false };
      } else {
        // For customer page: generate declaration PDF with bidderNumber
        const pdfResult = await generateRobustDeclarationPDF(formData, bidderNumber);
        declarationResult = { success: pdfResult.success, blob: pdfResult.blob, method: pdfResult.method, fallbackUsed: pdfResult.fallbackUsed };
        receiptResult = { success: true, blob: new Blob(), method: 'jspdf', fallbackUsed: false };
      }

      updateState({
        currentStep: 'saving',
        progress: 40
      });

      // Skip Firebase Storage upload - we'll just download the PDF directly
      console.log("Skipping Firebase Storage upload - downloading PDF directly");

      // Log generation method used
      console.log('PDF Generation Results:', {
        receipt: { method: receiptResult.method, fallbackUsed: receiptResult.fallbackUsed },
        declaration: { method: declarationResult.method, fallbackUsed: declarationResult.fallbackUsed }
      });

      // Skip Firestore save - data is already saved to Firebase Realtime Database
      console.log("Skipping Firestore save - data already saved to Firebase Realtime Database");
      const registrationNumber = generateUniqueRegistrationNumber();

      // Step 5: Download PDF for user (containing PNG with user data)
      if (isEmployeePage && receiptResult.blob) {
        // Download the receipt PDF for the employee (contains PNG with user data)
        const url = URL.createObjectURL(receiptResult.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${formData.bidderName}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (!isEmployeePage && declarationResult.blob) {
        // Download the declaration PDF for the customer (contains PNG with user data)
        const url = URL.createObjectURL(declarationResult.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `declaration_${formData.bidderName}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Step 6: Success - PDF generated and downloaded
      updateState({
        currentStep: 'success',
        progress: 100,
        isSubmitting: false,
        successData: {
          docId: `temp-${Date.now()}`,
          registrationNumber,
          receiptUrl: '',
          declarationUrl: '',
          firestoreError: null
        }
      });

    } catch (error) {
      console.error('Submit flow error:', error);
      updateState({
        currentStep: 'error',
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    }
  }, [updateState]);

  const retrySubmission = useCallback(async () => {
    if (lastFormData) {
      await submitForm(lastFormData, lastIsEmployeePage);
    }
  }, [lastFormData, lastIsEmployeePage, submitForm]);

  const resetFlow = useCallback(() => {
    setState({
      isSubmitting: false,
      currentStep: 'idle',
      progress: 0,
      error: null,
      successData: null
    });
    setLastFormData(null);
  }, []);

  return {
    ...state,
    submitForm,
    retrySubmission,
    resetFlow
  };
}

