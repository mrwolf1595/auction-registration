'use client';

import { ValidatedFormData } from './validation';

// Utility function to format numbers with thousand separators
const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Utility function to parse formatted number
const parseNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

// Create a simple PNG using Canvas API directly (more reliable)
async function createSimplePNG(formData: ValidatedFormData, bidderNumber?: number, isReceipt: boolean = false): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 794; // A4 width in pixels
    canvas.height = 1123; // A4 height in pixels
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('فشل في إنشاء Canvas');
    }
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 794, 1123);
    
    // Add logo at the top
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/Asset%202@2x.png';
      await new Promise((resolve) => {
        logoImg.onload = () => {
          ctx.drawImage(logoImg, 50, 20, 200, 60);
          resolve(true);
        };
        logoImg.onerror = () => resolve(true);
      });
    } catch (error) {
      console.log('Logo not loaded, continuing without it');
    }
    
    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);
    
    let yPosition = 80;
    
    if (isReceipt) {
      // Receipt content with better styling
      yPosition = 120; // Start after logo
      
      // Main title with gradient effect
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.fillText('إيصال استلام - للموظف', 397, yPosition);
      yPosition += 50;
      
      // Bidder number with better styling
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(`رقم المضرب: ${bidderNumber || 'غير محدد'}`, 397, yPosition);
      yPosition += 30;
      
      // Date with better styling
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 397, yPosition);
      yPosition += 50;
      
      // Bidder data
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('بيانات المزايد', 397, yPosition);
      yPosition += 30;
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(`اسم المزايد: ${formData.bidderName}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`رقم الهوية: ${formData.idNumber}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`رقم الجوال: ${formData.phoneNumber}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`البنك المصدر: ${formData.issuingBank}`, 600, yPosition);
      yPosition += 40;
      
      // Cheques table
      ctx.textAlign = 'center';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('تفاصيل الشيكات', 397, yPosition);
      yPosition += 30;
      
      // Table header
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('رقم الشيك', 200, yPosition);
      ctx.fillText('المبلغ (ريال سعودي)', 600, yPosition);
      yPosition += 30;
      
      // Table rows
      formData.cheques.forEach(cheque => {
        ctx.fillText(cheque.number, 200, yPosition);
        ctx.fillText(formatNumber(cheque.amount), 600, yPosition);
        yPosition += 25;
      });
      
      // Total
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('المجموع الكلي', 200, yPosition);
      ctx.fillText(formatNumber(totalAmount.toString()), 600, yPosition);
      yPosition += 50;
      
      // Employee data
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('بيانات الموظف مستلم الشيك', 397, yPosition);
      yPosition += 30;
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(`اسم الموظف: ${formData.employeeName}`, 600, yPosition);
      yPosition += 30;
      
      // Signature box
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(297, yPosition, 200, 80);
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('توقيع الموظف', 397, yPosition + 20);
      ctx.fillText(formData.employeeName, 397, yPosition + 50);
      
    } else {
      // Declaration content
      const finalBidderNumber = bidderNumber || Math.floor(Math.random() * 200) + 1;
      
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('إقرار المشاركة - للعميل', 397, yPosition);
      yPosition += 40;
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#333333';
      ctx.fillText(`رقم المضرب: ${finalBidderNumber}`, 397, yPosition);
      yPosition += 30;
      
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 397, yPosition);
      yPosition += 50;
      
      // Bidder data
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('بيانات المزايد', 397, yPosition);
      yPosition += 30;
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(`اسم المزايد: ${formData.bidderName}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`رقم الهوية: ${formData.idNumber}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`رقم الجوال: ${formData.phoneNumber}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`البنك المصدر: ${formData.issuingBank}`, 600, yPosition);
      yPosition += 40;
      
      // Cheques table
      ctx.textAlign = 'center';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('تفاصيل الشيكات', 397, yPosition);
      yPosition += 30;
      
      // Table header
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('رقم الشيك', 200, yPosition);
      ctx.fillText('المبلغ (ريال سعودي)', 600, yPosition);
      yPosition += 30;
      
      // Table rows
      formData.cheques.forEach(cheque => {
        ctx.fillText(cheque.number, 200, yPosition);
        ctx.fillText(formatNumber(cheque.amount), 600, yPosition);
        yPosition += 25;
      });
      
      // Total
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('المجموع الكلي', 200, yPosition);
      ctx.fillText(formatNumber(totalAmount.toString()), 600, yPosition);
      yPosition += 50;
      
      // Declaration clauses
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('إقرار وتعهد', 397, yPosition);
      yPosition += 30;
      
      const arabicClauses = [
        'أقر وأتعهد بأن جميع البيانات المدخلة صحيحة ومطابقة للواقع.',
        'أقر وأتعهد بأنني أتحمل المسؤولية الكاملة عن صحة الشيكات المقدمة.',
        'أقر وأتعهد بأنني سأقوم بسداد جميع المبالغ المستحقة في المواعيد المحددة.',
        'أقر وأتعهد بأنني لن أتراجع عن المشاركة في المزاد بعد تقديم العطاء.',
        'أقر وأتعهد بأنني سألتزم بجميع الشروط والأحكام المعلنة.'
      ];
      
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      
      arabicClauses.forEach((clause, index) => {
        ctx.fillText(`${index + 1}. ${clause}`, 600, yPosition);
        yPosition += 20;
      });
      
      yPosition += 30;
      
      // Signature section
      ctx.textAlign = 'center';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('توقيع المزايد', 397, yPosition);
      yPosition += 30;
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.fillText(`اسم المزايد: ${formData.bidderName}`, 600, yPosition);
      yPosition += 25;
      ctx.fillText(`التوقيع: ${formData.signature ? 'تم التوقيع' : (formData.typedName || 'لم يتم التوقيع')}`, 600, yPosition);
      yPosition += 30;
      
      // Signature box
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(297, yPosition, 200, 80);
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('توقيع المزايد', 397, yPosition + 20);
      ctx.fillText(formData.typedName || formData.bidderName, 397, yPosition + 50);
    }
    
    // Convert to PNG blob
    const pngResult = await new Promise<{ blob: Blob; dataURL: string }>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const dataURL = canvas.toDataURL('image/png', 1.0);
          resolve({ blob, dataURL });
        } else {
          throw new Error('فشل في إنشاء صورة PNG');
        }
      }, 'image/png', 1.0);
    });
    
    return pngResult;
    
  } catch (error) {
    console.error('Simple PNG creation error:', error);
    throw new Error('فشل في إنشاء صورة PNG بسيطة');
  }
}

// Convert PNG to PDF
async function convertPNGToPDF(pngBlob: Blob): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Get A4 dimensions in mm
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Convert PNG blob to data URL
    const pngDataURL = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(pngBlob);
    });
    
    // Add the PNG image to fill the entire page
    doc.addImage(pngDataURL, 'PNG', 0, 0, pageWidth, pageHeight);
    
    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    const pdfDataURL = doc.output('dataurlstring');
    
    return {
      blob: pdfBlob,
      dataURL: pdfDataURL
    };
    
  } catch (error) {
    console.error('PNG to PDF conversion error:', error);
    throw new Error('فشل في تحويل PNG إلى PDF');
  }
}

// Main function: Create simple PNG with user data, then convert to PDF for download
export async function generateReceiptPDFFromSimplePNG(formData: ValidatedFormData, bidderNumber?: number): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Step 1: Create simple PNG with user data (not downloaded)
    console.log('Creating simple PNG with user data...');
    const pngResult = await createSimplePNG(formData, bidderNumber, true);
    console.log('Simple PNG created successfully, size:', pngResult.blob.size);
    
    // Step 2: Convert PNG to PDF
    console.log('Converting PNG to PDF...');
    const pdfResult = await convertPNGToPDF(pngResult.blob);
    console.log('PDF created successfully, size:', pdfResult.blob.size);
    
    return pdfResult;
    
  } catch (error) {
    console.error('Receipt PDF generation error:', error);
    throw new Error('فشل في إنشاء ملف PDF للإيصال');
  }
}

// Main function: Create simple PNG with user data, then convert to PDF for download
export async function generateDeclarationPDFFromSimplePNG(formData: ValidatedFormData, bidderNumber?: number): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Step 1: Create simple PNG with user data (not downloaded)
    console.log('Creating simple PNG with user data...');
    const pngResult = await createSimplePNG(formData, bidderNumber, false);
    console.log('Simple PNG created successfully, size:', pngResult.blob.size);
    
    // Step 2: Convert PNG to PDF
    console.log('Converting PNG to PDF...');
    const pdfResult = await convertPNGToPDF(pngResult.blob);
    console.log('PDF created successfully, size:', pdfResult.blob.size);
    
    return pdfResult;
    
  } catch (error) {
    console.error('Declaration PDF generation error:', error);
    throw new Error('فشل في إنشاء ملف PDF للإقرار');
  }
}
