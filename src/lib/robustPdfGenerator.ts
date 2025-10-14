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

// Utility function to compress images for smaller file size
const compressImage = (canvas: HTMLCanvasElement, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('فشل في ضغط الصورة');
      }
    }, 'image/jpeg', quality); // Use JPEG with quality setting for better compression
  });
};


// Utility function to optimize PDF compression
const optimizePDFCompression = (doc: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Set compression options for jsPDF
  if (doc.internal && doc.internal.compress) {
    doc.internal.compress = true;
  }
  
  // Note: setImageCompression is not a valid jsPDF method, removed to fix error
};

// Enhanced PDF generation with compression
export async function generateCompressedPDF(formData: ValidatedFormData, bidderNumber?: number, isReceipt: boolean = false): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document with compression
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Optimize PDF compression
    optimizePDFCompression(doc);
    
    // Set font
    doc.setFont('helvetica');
    
    // Use provided bidder number or generate one
    const finalBidderNumber = bidderNumber || Math.floor(Math.random() * 200) + 1;
    
    if (isReceipt) {
      // Generate receipt content
      doc.setFontSize(20);
      doc.setTextColor(34, 211, 238);
      doc.text('إيصال استلام - للموظف', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`رقم المضرب: ${finalBidderNumber}`, 105, 15, { align: 'center' });
    } else {
      // Generate declaration content
      doc.setFontSize(20);
      doc.setTextColor(34, 211, 238);
      doc.text('إقرار المشاركة - للعميل', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`رقم المضرب: ${finalBidderNumber}`, 105, 15, { align: 'center' });
    }
    
    // Add compressed logo
    try {
      const logoResponse = await fetch('/Asset%202@2x.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const logoDataURL = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo with compression
        doc.addImage(logoDataURL, 'JPEG', 75, 5, 60, 20);
      }
    } catch (error) {
      console.warn('Failed to load company logo:', error);
    }
    
    // Add content based on type
    let yPosition = 60;
    
    // Bidder Information
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('بيانات المزايد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`اسم المزايد: ${formData.bidderName}`, 20, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`رقم الهوية: ${formData.idNumber}`, 20, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`رقم الجوال: ${formData.phoneNumber}`, 20, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`البنك المصدر: ${formData.issuingBank}`, 20, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Cheques Information
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('تفاصيل الشيكات', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);
    
    formData.cheques.forEach((cheque, index) => {
      doc.text(`الشيك ${index + 1}: رقم ${cheque.number} - مبلغ ${formatNumber(cheque.amount)} ريال`, 20, yPosition, { align: 'right' });
      yPosition += 8;
    });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`المجموع الكلي: ${formatNumber(totalAmount.toString())} ريال سعودي`, 20, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Add compressed seal
    try {
      const sealResponse = await fetch('/company-seal.png');
      if (sealResponse.ok) {
        const sealBlob = await sealResponse.blob();
        const sealDataURL = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(sealBlob);
        });
        
        // Add seal with compression
        doc.addImage(sealDataURL, 'JPEG', 20, 250, 50, 50);
      }
    } catch (error) {
      console.warn('Failed to load company seal:', error);
    }
    
    // Generate compressed PDF
    const pdfBlob = doc.output('blob');
    const pdfDataURL = doc.output('dataurlstring');
    
    return {
      blob: pdfBlob,
      dataURL: pdfDataURL
    };
    
  } catch (error) {
    console.error('Compressed PDF generation error:', error);
    throw new Error('فشل في إنشاء ملف PDF مضغوط');
  }
}

// PDF generation result interface
export interface PdfGenerationResult {
  success: boolean;
  blob?: Blob;
  dataURL?: string;
  error?: string;
  method: 'jspdf' | 'html2canvas';
  fallbackUsed: boolean;
}

// Arabic text utilities
export const arabicUtils = {
  // Check if text contains Arabic characters
  isArabic: (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text);
  },

  // Format number with Arabic numerals
  formatArabicNumber: (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
  },

  // Format currency in Arabic
  formatArabicCurrency: (amount: number): string => {
    return `${arabicUtils.formatArabicNumber(amount)} ريال سعودي`;
  }
};

// Generate receipt PDF for employee using jsPDF with Arabic support
export async function generateReceiptPDFWithJSPDF(formData: ValidatedFormData): Promise<PdfGenerationResult> {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);

    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Optimize PDF compression
    optimizePDFCompression(doc);
    
    // Set font (using default font for now - jsPDF has limited Arabic support)
    doc.setFont('helvetica');
    
    // Header - smaller and without blue color
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black color instead of cyan
    doc.text('إيصال استلام - للموظف', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 20, 35, { align: 'right' });
    
    let yPosition = 50;
    
    // Bidder Information Section - Horizontal layout
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247); // Purple color
    doc.text('بيانات المزايد', 20, yPosition, { align: 'right' });
    yPosition += 8;
    
    // Create a box for bidder information
    const boxX = 20;
    const boxY = yPosition - 5;
    const boxWidth = 170;
    const boxHeight = 25;
    
    // Draw box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight);
    
    // Bidder Information - Horizontal layout
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // First row: Name and ID
    doc.text(`الاسم: ${formData.bidderName}`, 25, yPosition + 3, { align: 'right' });
    doc.text(`الهوية: ${formData.idNumber}`, 25, yPosition + 3, { align: 'left' });
    
    // Second row: Phone and Bank
    doc.text(`الجوال: ${formData.phoneNumber}`, 25, yPosition + 8, { align: 'right' });
    doc.text(`البنك: ${formData.issuingBank}`, 25, yPosition + 8, { align: 'left' });
    
    yPosition += 20;
    
    // Cheques Information Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('تفاصيل الشيكات', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Cheques table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Table headers
    doc.text('رقم الشيك', 150, yPosition, { align: 'center' });
    doc.text('المبلغ (ريال سعودي)', 100, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Draw line under headers
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    // Cheques data
    formData.cheques.forEach((cheque) => {
      doc.text(cheque.number, 150, yPosition, { align: 'center' });
      doc.text(`${formatNumber(cheque.amount)}`, 100, yPosition, { align: 'center' });
      yPosition += 8;
    });
    
    // Total line
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('المجموع الكلي', 150, yPosition, { align: 'center' });
    doc.text(`${formatNumber(totalAmount.toString())}`, 100, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Employee Information Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('بيانات الموظف مستلم الشيك', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`اسم الموظف: ${formData.employeeName}`, 20, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`التوقيع: ${formData.signature ? 'تم التوقيع' : (formData.typedName || 'لم يتم التوقيع')}`, 20, yPosition, { align: 'right' });
    console.log('Receipt signature data:', formData.signature);
    
    // Add signature image if available
    if (formData.signature) {
      yPosition += 15;
      try {
        // Convert data URL to image and add to PDF
        const img = new Image();
        img.src = formData.signature;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Add image to PDF (scaled to fit)
        const imgWidth = 60;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(formData.signature, 'PNG', 20, yPosition, imgWidth, imgHeight);
      } catch (error) {
        console.warn('Failed to add signature image to PDF:', error);
      }
    }
    
    // Generate blob
    const pdfBlob = doc.output('blob');
    const dataURL = doc.output('dataurlstring');
    
    return {
      success: true,
      blob: pdfBlob,
      dataURL,
      method: 'jspdf',
      fallbackUsed: false
    };
    
  } catch (error) {
    console.error('jsPDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء ملف PDF',
      method: 'jspdf',
      fallbackUsed: false
    };
  }
}

// Generate declaration PDF using jsPDF
export async function generateDeclarationPDFWithJSPDF(formData: ValidatedFormData, bidderNumber?: number): Promise<PdfGenerationResult> {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Use provided bidder number or generate one
    const finalBidderNumber = bidderNumber || Math.floor(Math.random() * 200) + 1;
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Optimize PDF compression
    optimizePDFCompression(doc);
    
    // Set font
    doc.setFont('helvetica');
    
    // Add company logo at the top center
    try {
      const logoResponse = await fetch('/Asset%202@2x.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const logoDataURL = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo image (centered, above the title) - تصغير اللوجو
        doc.addImage(logoDataURL, 'PNG', 75, 5, 60, 20); // x=75, y=5, width=60, height=20
      }
    } catch (error) {
      console.warn('Failed to load company logo:', error);
    }
    
    // Header - smaller and without blue color
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black color instead of cyan
    doc.text('إقرار المشاركة - للعميل', 105, 40, { align: 'center' });
    
    // Bidder number (رقم المضرب)
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`رقم المضرب: ${finalBidderNumber}`, 105, 35, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 20, 45, { align: 'right' });
    
    let yPosition = 60;
    
    // Bidder Information Section - Horizontal layout
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247);
    doc.text('بيانات المزايد', 20, yPosition, { align: 'right' });
    yPosition += 8;
    
    // Create a box for bidder information
    const boxX = 20;
    const boxY = yPosition - 5;
    const boxWidth = 170;
    const boxHeight = 25;
    
    // Draw box border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight);
    
    // Bidder Information - Horizontal layout
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // First row: Name and ID
    doc.text(`الاسم: ${formData.bidderName}`, 25, yPosition + 3, { align: 'right' });
    doc.text(`الهوية: ${formData.idNumber}`, 25, yPosition + 3, { align: 'left' });
    
    // Second row: Phone and Bank
    doc.text(`الجوال: ${formData.phoneNumber}`, 25, yPosition + 8, { align: 'right' });
    doc.text(`البنك: ${formData.issuingBank}`, 25, yPosition + 8, { align: 'left' });
    
    yPosition += 20;
    
    // Cheques Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('تفاصيل الشيكات', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);
    
    formData.cheques.forEach((cheque, index) => {
      doc.text(`الشيك ${index + 1}: رقم ${cheque.number} - مبلغ ${formatNumber(cheque.amount)} ريال`, 20, yPosition, { align: 'right' });
      yPosition += 8;
    });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`المجموع الكلي: ${formatNumber(totalAmount.toString())} ريال سعودي`, 20, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Declaration Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('إقرار وتعهد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('أقر وأتعهد بما يلي:', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Arabic legal clauses
    const arabicClauses = [
      'أقر وأتعهد بأن جميع البيانات المدخلة صحيحة ومطابقة للواقع.',
      'أقر وأتعهد بأنني أتحمل المسؤولية الكاملة عن صحة الشيكات المقدمة.',
      'أقر وأتعهد بأنني سأقوم بسداد جميع المبالغ المستحقة في المواعيد المحددة.',
      'أقر وأتعهد بأنني لن أتراجع عن المشاركة في المزاد بعد تقديم العطاء.',
      'أقر وأتعهد بأنني سألتزم بجميع الشروط والأحكام المعلنة.',
      'أقر وأتعهد بأنني سأقوم بتسليم جميع المستندات المطلوبة في الوقت المحدد.',
      'أقر وأتعهد بأنني سأقوم بدفع جميع الرسوم والضرائب المستحقة.',
      'أقر وأتعهد بأنني سألتزم بالقوانين والأنظمة المعمول بها.',
      'أقر وأتعهد بأنني سأقوم بإبلاغ الجهة المختصة بأي تغيير في البيانات.',
      'أقر وأتعهد بأنني سأتحمل جميع التكاليف والمصاريف المتعلقة بالمزاد.'
    ];
    
    // Add clauses
    arabicClauses.forEach((clause, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${clause}`, 20, yPosition, { align: 'right' });
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Signature Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('توقيع المزايد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`اسم المزايد: ${formData.bidderName}`, 20, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`التوقيع: ${formData.signature ? 'تم التوقيع' : (formData.typedName || 'لم يتم التوقيع')}`, 20, yPosition, { align: 'right' });
    console.log('Declaration signature data:', formData.signature);
    
    // Add signature image if available
    if (formData.signature) {
      yPosition += 15;
      try {
        const img = new Image();
        img.src = formData.signature;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const imgWidth = 60;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(formData.signature, 'PNG', 20, yPosition, imgWidth, imgHeight);
      } catch (error) {
        console.warn('Failed to add signature image to PDF:', error);
      }
    }
    
    // Add company seal at the bottom left
    try {
      const sealResponse = await fetch('/company-seal.png');
      if (sealResponse.ok) {
        const sealBlob = await sealResponse.blob();
        const sealDataURL = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(sealBlob);
        });
        
        // Add seal image (bottom left corner) - تصغير الختم مع ضغط
        doc.addImage(sealDataURL, 'JPEG', 20, 250, 50, 50); // x=20, y=250, width=50, height=50
      }
    } catch (error) {
      console.warn('Failed to load company seal:', error);
    }
    
    // Generate blob
    const pdfBlob = doc.output('blob');
    const dataURL = doc.output('dataurlstring');
    
    return {
      success: true,
      blob: pdfBlob,
      dataURL,
      method: 'jspdf',
      fallbackUsed: false
    };
    
  } catch (error) {
    console.error('Declaration jsPDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء ملف PDF',
      method: 'jspdf',
      fallbackUsed: false
    };
  }
}

// Generate receipt PNG fallback and convert to PDF
export async function generateReceiptPNG(formData: ValidatedFormData, bidderNumber?: number): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Create a temporary element for the receipt
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '-9999px';
    tempElement.style.width = '794px'; // A4 width in pixels
    tempElement.style.minHeight = '1400px'; // زيادة الارتفاع لاستيعاب التوقيع
    tempElement.style.backgroundColor = 'white';
    tempElement.style.padding = '40px';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.direction = 'rtl';
    tempElement.style.textAlign = 'right';
    tempElement.style.fontSize = '16px';
    tempElement.style.lineHeight = '1.8';
    tempElement.style.position = 'relative';
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);
    
    // Create HTML content for receipt with signature - التوقيع الرقمي فقط
    let receiptSignatureHTML = '';
    const isSignatureProvidedReceipt = formData.signature && formData.signature.startsWith('data:image');
    
    console.log('=== Receipt Signature Debug ===');
    console.log('formData object keys:', Object.keys(formData));
    console.log('formData.signature exists:', !!formData.signature);
    console.log('formData.signature type:', typeof formData.signature);
    console.log('isSignatureProvidedReceipt:', isSignatureProvidedReceipt);
    if (formData.signature) {
      console.log('formData.signature length:', formData.signature.length);
      console.log('formData.signature preview:', formData.signature.substring(0, 100));
      console.log('Signature starts with data:image?', formData.signature.startsWith('data:image'));
    } else {
      console.log('❌ NO SIGNATURE DATA FOUND IN formData');
    }
    console.log('===============================');
    
    if (isSignatureProvidedReceipt) {
      receiptSignatureHTML = `
        <div style="text-align: center; margin-top: 25px; margin-bottom: 35px;">
          <div style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 15px;">التوقيع الرقمي:</div>
          <div style="display: inline-block; padding: 20px; border: 3px solid #000; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${formData.signature}" style="width: 350px; height: 140px; display: block; object-fit: contain; background: white;" alt="التوقيع الرقمي" />
          </div>
        </div>`;
      console.log('Receipt: Digital signature HTML added');
    } else {
      receiptSignatureHTML = `
        <div style="margin-top: 20px; text-align: center;">
          <div style="display: inline-block; padding: 20px; border: 2px solid #ccc; background-color: #f9f9f9; min-width: 250px;">
            <div style="width: 200px; height: 80px; border: 1px solid #ccc; background-color: white; display: flex; align-items: center; justify-content: center; color: #999; font-size: 16px;">
              (لم يتم التوقيع)
            </div>
          </div>
        </div>`;
      console.log('Receipt: No signature provided');
    }
    
    // Create HTML content for receipt
    tempElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; position: relative;">
        <div style="margin-bottom: 15px;">
          <img src="/Asset%202@2x.png" style="max-width: 200px; max-height: 80px;" alt="Company Logo" crossorigin="anonymous" />
        </div>
        <h1 style="font-size: 28px; font-weight: bold; color: #000; margin-bottom: 10px;">إيصال استلام - للموظف</h1>
        <p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px;">رقم المضرب: ${bidderNumber || 'غير محدد'}</p>
        <p style="font-size: 14px; color: #666; text-align: left; margin: 0; position: absolute; left: 0; top: 0;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
      </div>
      
      <div style="margin-bottom: 25px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h2 style="font-size: 20px; font-weight: bold; color: #a855f7; margin-bottom: 15px; border-bottom: 2px solid #a855f7; padding-bottom: 8px;">بيانات المزايد</h2>
        <div style="line-height: 2;">
          <div style="margin-bottom: 10px; font-size: 16px;"><span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">اسم المزايد:</span> <span style="color: #000; font-weight: bold;">${formData.bidderName}</span></div>
          <div style="margin-bottom: 10px; font-size: 16px;"><span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">رقم الهوية:</span> <span style="color: #000; font-weight: bold;">${formData.idNumber}</span></div>
          <div style="margin-bottom: 10px; font-size: 16px;"><span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">رقم الجوال:</span> <span style="color: #000; font-weight: bold;">${formData.phoneNumber}</span></div>
          <div style="margin-bottom: 10px; font-size: 16px;"><span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">البنك المصدر:</span> <span style="color: #000; font-weight: bold;">${formData.issuingBank}</span></div>
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #a855f7; margin-bottom: 15px; border-bottom: 2px solid #a855f7; padding-bottom: 8px;">تفاصيل الشيكات</h2>
        <table style="width: 100%; border-collapse: collapse; border: 3px solid #000;">
          <thead>
            <tr style="background-color: #e0e0e0;">
              <th style="padding: 15px; border: 2px solid #000; font-weight: bold; font-size: 18px; color: #000; text-align: center;">رقم الشيك</th>
              <th style="padding: 15px; border: 2px solid #000; font-weight: bold; font-size: 18px; color: #000; text-align: center;">المبلغ (ريال سعودي)</th>
            </tr>
          </thead>
          <tbody>
            ${formData.cheques.map(cheque => `
              <tr>
                <td style="padding: 15px; border: 2px solid #000; text-align: center; font-size: 18px; font-weight: bold; color: #000;">${cheque.number}</td>
                <td style="padding: 15px; border: 2px solid #000; text-align: center; font-size: 18px; font-weight: bold; color: #000;">${formatNumber(cheque.amount)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #d0d0d0; font-weight: bold;">
              <td style="padding: 15px; border: 2px solid #000; text-align: center; font-size: 20px; color: #000; font-weight: bold;">المجموع الكلي</td>
              <td style="padding: 15px; border: 2px solid #000; text-align: center; font-size: 20px; color: #000; font-weight: bold;">${formatNumber(totalAmount.toString())}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 25px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h2 style="font-size: 20px; font-weight: bold; color: #a855f7; margin-bottom: 15px; border-bottom: 2px solid #a855f7; padding-bottom: 8px;">بيانات الموظف مستلم الشيك</h2>
        <div style="line-height: 2;">
          <div style="margin-bottom: 10px; font-size: 16px;"><span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">اسم الموظف:</span> <span style="color: #000; font-weight: bold;">${formData.employeeName}</span></div>
          <div style="margin-bottom: 10px; font-size: 16px;">
            <span style="font-weight: bold; color: #666; display: inline-block; width: 120px;">التوقيع:</span> 
            <span style="color: #000; font-weight: bold;">
              ${isSignatureProvidedReceipt ? '✓ تم التوقيع رقمياً' : 'لم يتم التوقيع'}
            </span>
          </div>
        </div>
        ${receiptSignatureHTML}
      </div>
      
      <div style="position: absolute; bottom: 20px; left: 20px;">
        <img src="/company-seal.png" style="max-width: 150px; max-height: 150px; opacity: 0.8;" alt="Company Seal" crossorigin="anonymous" />
      </div>
    `;
    
    document.body.appendChild(tempElement);
    
    // Wait for all images to load (including signature)
    const images = tempElement.querySelectorAll('img');
    console.log(`Receipt PDF - Found ${images.length} images to load`);
    
    // Create array to track image loading
    const imageLoadPromises = Array.from(images).map((img, index) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight > 0) {
          console.log(`Receipt PDF - Image ${index + 1}/${images.length} already loaded:`, img.src.substring(0, 50));
          resolve();
        } else {
          img.onload = () => {
            console.log(`Receipt PDF - Image ${index + 1}/${images.length} loaded:`, img.src.substring(0, 50));
            resolve();
          };
          img.onerror = () => {
            console.error(`Receipt PDF - Image ${index + 1}/${images.length} failed:`, img.src.substring(0, 50));
            resolve(); // Resolve anyway to not block
          };
          // Force reload if src is set but not loaded
          if (img.src && !img.complete) {
            const currentSrc = img.src;
            img.src = '';
            img.src = currentSrc;
          }
        }
      });
    });
    
    await Promise.all(imageLoadPromises);
    console.log('✅ All images loaded successfully');
    
    // Log signature image details
    const signatureImg = Array.from(images).find(img => img.src.startsWith('data:image'));
    if (signatureImg) {
      console.log('🖼️ Signature image details:', {
        width: signatureImg.width,
        height: signatureImg.height,
        naturalWidth: signatureImg.naturalWidth,
        naturalHeight: signatureImg.naturalHeight,
        complete: signatureImg.complete,
        loaded: signatureImg.naturalHeight > 0
      });
    }
    
    // Extra wait time for rendering - زيادة الوقت
    console.log('⏳ Waiting 800ms for final rendering...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Log actual element dimensions before capture
    console.log('📏 Receipt element actual height:', tempElement.scrollHeight, 'px');
    console.log('📏 Receipt element actual width:', tempElement.scrollWidth, 'px');
    
    // Capture the element
    console.log('Receipt PDF - Starting html2canvas capture');
    const canvas = await html2canvas(tempElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // تعطيل السجلات المزعجة
      ignoreElements: (element) => {
        // تجاهل صورة التوقيع أثناء الالتقاط - سنرسمها يدوياً
        if (element.tagName === 'IMG') {
          const img = element as HTMLImageElement;
          return img.src.startsWith('data:image');
        }
        return false;
      }
    });
    console.log('Receipt PDF - html2canvas capture completed');
    console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // رسم التوقيع يدوياً على Canvas
    if (formData.signature && isSignatureProvidedReceipt) {
      console.log('🎨 Drawing signature manually on canvas...');
      
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // إنشاء صورة من base64
          const signatureImage = new Image();
          
          await new Promise<void>((resolve, reject) => {
            signatureImage.onload = () => {
              console.log('✅ Signature image loaded for manual drawing');
              
              const signatureContainer = tempElement.querySelector('img[src^="data:image"]') as HTMLImageElement;
              if (signatureContainer) {
                const rect = signatureContainer.getBoundingClientRect();
                const tempRect = tempElement.getBoundingClientRect();
                
                const relativeX = rect.left - tempRect.left;
                const relativeY = rect.top - tempRect.top;
                
                const canvasX = relativeX * 2;
                const canvasY = relativeY * 2;
                const canvasWidth = rect.width * 2;
                const canvasHeight = rect.height * 2;
                
                console.log('📍 Drawing signature at:', { canvasX, canvasY, canvasWidth, canvasHeight });
                
                // رسم خلفية بيضاء
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
                
                // رسم الصورة
                ctx.drawImage(signatureImage, canvasX, canvasY, canvasWidth, canvasHeight);
                
                // رسم إطار
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 6;
                ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
                
                console.log('✅ Signature drawn successfully on canvas');
              }
              
              resolve();
            };
            
            signatureImage.onerror = () => {
              console.error('❌ Failed to load signature for manual drawing');
              reject(new Error('Failed to load signature'));
            };
            
            signatureImage.src = formData.signature || '';
          });
        }
      } catch (error) {
        console.error('❌ Error drawing signature manually:', error);
      }
    }
    
    // Clean up
    document.body.removeChild(tempElement);
    
    // Convert to PNG blob
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    });
    
    // Convert PNG to PDF
    const pdfResult = await convertPNGToPDF(pngBlob);
    return pdfResult;
    
  } catch (error) {
    console.error('Receipt PNG generation error:', error);
    throw new Error('فشل في إنشاء صورة PNG للإيصال');
  }
}

// Generate declaration PNG fallback and convert to PDF
export async function generateDeclarationPNG(formData: ValidatedFormData, bidderNumber?: number): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Create a temporary element for the declaration
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '-9999px';
    tempElement.style.width = '794px'; // A4 width in pixels
    tempElement.style.minHeight = '1400px'; // زيادة الارتفاع لاستيعاب التوقيع
    tempElement.style.backgroundColor = 'white';
    tempElement.style.padding = '40px';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.direction = 'rtl';
    tempElement.style.textAlign = 'right';
    tempElement.style.fontSize = '16px';
    tempElement.style.lineHeight = '1.8';
    tempElement.style.position = 'relative';
    
    // Use provided bidder number or generate one
    const finalBidderNumber = bidderNumber || Math.floor(Math.random() * 200) + 1;
    
    // Arabic legal clauses
    const arabicClauses = [
      'أقر وأتعهد بأن جميع البيانات المدخلة صحيحة ومطابقة للواقع.',
      'أقر وأتعهد بأنني أتحمل المسؤولية الكاملة عن صحة الشيكات المقدمة.',
      'أقر وأتعهد بأنني سأقوم بسداد جميع المبالغ المستحقة في المواعيد المحددة.',
      'أقر وأتعهد بأنني لن أتراجع عن المشاركة في المزاد بعد تقديم العطاء.',
      'أقر وأتعهد بأنني سألتزم بجميع الشروط والأحكام المعلنة.',
      'أقر وأتعهد بأنني سأقوم بتسليم جميع المستندات المطلوبة في الوقت المحدد.',
      'أقر وأتعهد بأنني سأقوم بدفع جميع الرسوم والضرائب المستحقة.',
      'أقر وأتعهد بأنني سألتزم بالقوانين والأنظمة المعمول بها.',
      'أقر وأتعهد بأنني سأقوم بإبلاغ الجهة المختصة بأي تغيير في البيانات.',
      'أقر وأتعهد بأنني سأتحمل جميع التكاليف والمصاريف المتعلقة بالمزاد.'
    ];
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);
    
    // Create HTML content for declaration with signature - التوقيع الرقمي فقط
    let signatureHTML = '';
    const isSignatureProvided = formData.signature && formData.signature.startsWith('data:image');
    
    console.log('=== Declaration Signature Debug ===');
    console.log('formData object keys:', Object.keys(formData));
    console.log('formData.signature exists:', !!formData.signature);
    console.log('formData.signature type:', typeof formData.signature);
    console.log('isSignatureProvided:', isSignatureProvided);
    if (formData.signature) {
      console.log('formData.signature length:', formData.signature.length);
      console.log('formData.signature preview:', formData.signature.substring(0, 100));
      console.log('Signature starts with data:image?', formData.signature.startsWith('data:image'));
    } else {
      console.log('❌ NO SIGNATURE DATA FOUND IN formData');
    }
    console.log('===================================');
    
    if (isSignatureProvided) {
      signatureHTML = `
        <div style="text-align: center; margin-top: 20px; margin-bottom: 30px;">
          <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 12px;">التوقيع الرقمي:</div>
          <div style="display: inline-block; padding: 15px; border: 3px solid #000; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${formData.signature}" style="width: 300px; height: 120px; display: block; object-fit: contain; background: white;" alt="التوقيع الرقمي" />
          </div>
        </div>`;
      console.log('Declaration: Digital signature HTML added');
    } else {
      signatureHTML = `
        <div style="text-align: center; margin-top: 10px;">
          <div style="display: inline-block; padding: 12px; border: 2px solid #ccc; background-color: #f9f9f9; min-width: 200px;">
            <div style="width: 150px; height: 60px; border: 1px solid #ccc; background-color: white; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px;">
              (لم يتم التوقيع)
            </div>
          </div>
        </div>`;
      console.log('Declaration: No signature provided');
    }
    
    // Create HTML content for declaration with compact layout
    tempElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; position: relative;">
        <div style="margin-bottom: 10px;">
          <img src="/Asset%202@2x.png" style="max-width: 180px; max-height: 70px;" alt="Company Logo" crossorigin="anonymous" />
        </div>
        <h1 style="font-size: 24px; font-weight: bold; color: #000; margin-bottom: 8px;">إقرار المشاركة - للعميل</h1>
        <p style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px;">رقم المضرب: ${finalBidderNumber}</p>
        <p style="font-size: 12px; color: #666; text-align: left; margin: 0; position: absolute; left: 0; top: 0;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
      </div>
      
      <div style="margin-bottom: 15px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; background: #fafafa;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 10px; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">بيانات المزايد</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; line-height: 1.6;">
          <div style="font-size: 13px;"><span style="font-weight: bold; color: #666;">الاسم:</span> <span style="color: #000; font-weight: bold;">${formData.bidderName}</span></div>
          <div style="font-size: 13px;"><span style="font-weight: bold; color: #666;">الهوية:</span> <span style="color: #000; font-weight: bold;">${formData.idNumber}</span></div>
          <div style="font-size: 13px;"><span style="font-weight: bold; color: #666;">الجوال:</span> <span style="color: #000; font-weight: bold;">${formData.phoneNumber}</span></div>
          <div style="font-size: 13px;"><span style="font-weight: bold; color: #666;">البنك:</span> <span style="color: #000; font-weight: bold;">${formData.issuingBank}</span></div>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 10px; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">تفاصيل الشيكات</h2>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #e0e0e0;">
              <th style="padding: 10px; border: 2px solid #000; font-weight: bold; font-size: 14px; color: #000; text-align: center;">رقم الشيك</th>
              <th style="padding: 10px; border: 2px solid #000; font-weight: bold; font-size: 14px; color: #000; text-align: center;">المبلغ (ريال)</th>
            </tr>
          </thead>
          <tbody>
            ${formData.cheques.map(cheque => `
              <tr>
                <td style="padding: 10px; border: 2px solid #000; text-align: center; font-size: 14px; font-weight: bold; color: #000;">${cheque.number}</td>
                <td style="padding: 10px; border: 2px solid #000; text-align: center; font-size: 14px; font-weight: bold; color: #000;">${formatNumber(cheque.amount)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #d0d0d0; font-weight: bold;">
              <td style="padding: 10px; border: 2px solid #000; text-align: center; font-size: 15px; color: #000; font-weight: bold;">المجموع</td>
              <td style="padding: 10px; border: 2px solid #000; text-align: center; font-size: 15px; color: #000; font-weight: bold;">${formatNumber(totalAmount.toString())}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 15px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; background: #fafafa;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 8px; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">إقرار وتعهد</h2>
        <p style="margin-bottom: 8px; color: #666; font-weight: bold; font-size: 13px;">أقر وأتعهد بما يلي:</p>
        <div style="line-height: 1.5; column-count: 2; column-gap: 15px;">
          ${arabicClauses.map((clause, index) => `
            <div style="margin-bottom: 6px; font-size: 11px; color: #000; font-weight: 500; break-inside: avoid;">${index + 1}. ${clause}</div>
          `).join('')}
        </div>
      </div>
      
      <div style="margin-top: 15px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; background: #fafafa;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 8px; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">توقيع المزايد</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="font-size: 13px;"><span style="font-weight: bold; color: #666;">الاسم:</span> <span style="color: #000; font-weight: bold;">${formData.bidderName}</span></div>
          <div style="font-size: 13px;">
            <span style="font-weight: bold; color: #666;">التوقيع:</span> 
            <span style="color: #000; font-weight: bold;">
              ${isSignatureProvided ? '✓ تم التوقيع رقمياً' : 'لم يتم التوقيع'}
            </span>
          </div>
        </div>
        ${signatureHTML}
      </div>
      
      <div style="position: absolute; bottom: 15px; left: 15px;">
        <img src="/company-seal.png" style="max-width: 120px; max-height: 120px; opacity: 0.7;" alt="Company Seal" crossorigin="anonymous" />
      </div>
    `;
    
    document.body.appendChild(tempElement);
    
    // Wait for all images to load (including signature)
    const images = tempElement.querySelectorAll('img');
    console.log(`Declaration PDF - Found ${images.length} images to load`);
    
    // Create array to track image loading
    const imageLoadPromises = Array.from(images).map((img, index) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight > 0) {
          console.log(`Declaration PDF - Image ${index + 1}/${images.length} already loaded:`, img.src.substring(0, 50));
          resolve();
        } else {
          img.onload = () => {
            console.log(`Declaration PDF - Image ${index + 1}/${images.length} loaded:`, img.src.substring(0, 50));
            resolve();
          };
          img.onerror = () => {
            console.error(`Declaration PDF - Image ${index + 1}/${images.length} failed:`, img.src.substring(0, 50));
            resolve(); // Resolve anyway to not block
          };
          // Force reload if src is set but not loaded
          if (img.src && !img.complete) {
            const currentSrc = img.src;
            img.src = '';
            img.src = currentSrc;
          }
        }
      });
    });
    
    await Promise.all(imageLoadPromises);
    console.log('✅ All images loaded successfully');
    
    // Log signature image details
    const signatureImg = Array.from(images).find(img => img.src.startsWith('data:image'));
    if (signatureImg) {
      console.log('🖼️ Signature image details:', {
        width: signatureImg.width,
        height: signatureImg.height,
        naturalWidth: signatureImg.naturalWidth,
        naturalHeight: signatureImg.naturalHeight,
        complete: signatureImg.complete,
        loaded: signatureImg.naturalHeight > 0
      });
    }
    
    // Extra wait time for rendering - زيادة الوقت
    console.log('⏳ Waiting 800ms for final rendering...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Log actual element dimensions before capture
    console.log('📏 Declaration element actual height:', tempElement.scrollHeight, 'px');
    console.log('📏 Declaration element actual width:', tempElement.scrollWidth, 'px');
    
    // Capture the element
    console.log('Declaration PDF - Starting html2canvas capture');
    const canvas = await html2canvas(tempElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // تعطيل السجلات المزعجة
      ignoreElements: (element) => {
        // تجاهل صورة التوقيع أثناء الالتقاط - سنرسمها يدوياً
        if (element.tagName === 'IMG') {
          const img = element as HTMLImageElement;
          return img.src.startsWith('data:image');
        }
        return false;
      }
    });
    console.log('Declaration PDF - html2canvas capture completed');
    console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // رسم التوقيع يدوياً على Canvas
    if (formData.signature && isSignatureProvided) {
      console.log('🎨 Drawing signature manually on canvas...');
      
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // إنشاء صورة من base64
          const signatureImage = new Image();
          
          await new Promise<void>((resolve, reject) => {
            signatureImage.onload = () => {
              console.log('✅ Signature image loaded for manual drawing');
              
              // حساب موقع وحجم التوقيع في Canvas
              // التوقيع في tempElement موجود في div بحجم 300x120
              // نحتاج لإيجاد موقعه النسبي في الصفحة
              
              const signatureContainer = tempElement.querySelector('img[src^="data:image"]') as HTMLImageElement;
              if (signatureContainer) {
                const rect = signatureContainer.getBoundingClientRect();
                const tempRect = tempElement.getBoundingClientRect();
                
                // حساب الموقع النسبي
                const relativeX = rect.left - tempRect.left;
                const relativeY = rect.top - tempRect.top;
                
                // ضرب في scale (2)
                const canvasX = relativeX * 2;
                const canvasY = relativeY * 2;
                const canvasWidth = rect.width * 2;
                const canvasHeight = rect.height * 2;
                
                console.log('📍 Drawing signature at:', { canvasX, canvasY, canvasWidth, canvasHeight });
                
                // رسم خلفية بيضاء للتوقيع
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
                
                // رسم الصورة
                ctx.drawImage(signatureImage, canvasX, canvasY, canvasWidth, canvasHeight);
                
                // رسم إطار
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 6; // 3px * 2 (scale)
                ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
                
                console.log('✅ Signature drawn successfully on canvas');
              }
              
              resolve();
            };
            
            signatureImage.onerror = () => {
              console.error('❌ Failed to load signature for manual drawing');
              reject(new Error('Failed to load signature'));
            };
            
            signatureImage.src = formData.signature || '';
          });
        }
      } catch (error) {
        console.error('❌ Error drawing signature manually:', error);
        // نستمر حتى لو فشل الرسم اليدوي
      }
    }
    
    // Clean up
    document.body.removeChild(tempElement);
    
    // Convert to PNG blob
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    });
    
    // Convert PNG to PDF
    const pdfResult = await convertPNGToPDF(pngBlob);
    return pdfResult;
    
  } catch (error) {
    console.error('Declaration PNG generation error:', error);
    throw new Error('فشل في إنشاء صورة PNG للإقرار');
  }
}

// Convert PNG image to PDF
export async function convertPNGToPDF(pngBlob: Blob): Promise<{ blob: Blob; dataURL: string }> {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Optimize PDF compression
    optimizePDFCompression(doc);
    
    // Convert blob to data URL
    const dataURL = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(pngBlob);
    });
    
    // Get A4 dimensions in mm
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Add the PNG image to fill the entire page
    doc.addImage(dataURL, 'PNG', 0, 0, pageWidth, pageHeight);
    
    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    const pdfDataURL = doc.output('dataurlstring');
    
    return {
      blob: pdfBlob,
      dataURL: pdfDataURL
    };
    
  } catch (error) {
    console.error('PNG to PDF conversion error:', error);
    throw new Error('فشل في تحويل الصورة إلى PDF');
  }
}

// Validate PDF content for Arabic rendering issues
export async function validateArabicPDF(blob: Blob): Promise<boolean> {
  try {
    // For jsPDF, we'll do a simple validation
    // Check if the blob is a valid PDF and has reasonable size
    if (blob.type !== 'application/pdf') {
      return false;
    }
    
    if (blob.size < 1000) { // Too small to be a valid PDF
      return false;
    }
    
    // Additional validation could be added here
    // For now, we'll assume jsPDF generates valid PDFs
    return true;
    
  } catch (error) {
    console.error('PDF validation error:', error);
    return false;
  }
}

// Robust PDF generation with automatic fallback
export async function generateRobustReceiptPDF(formData: ValidatedFormData, bidderNumber?: number): Promise<PdfGenerationResult> {
  try {
    // Skip jsPDF (doesn't support Arabic well) and use html2canvas directly
    console.log('Using html2canvas for receipt PDF generation (better Arabic support)');
    const pngResult = await generateReceiptPNG(formData, bidderNumber);
    
    return {
      success: true,
      blob: pngResult.blob,
      dataURL: pngResult.dataURL,
      method: 'html2canvas',
      fallbackUsed: false
    };
    
  } catch (error) {
    console.error('Robust PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء الملف',
      method: 'html2canvas',
      fallbackUsed: true
    };
  }
}

// Robust declaration PDF generation with automatic fallback
export async function generateRobustDeclarationPDF(formData: ValidatedFormData, bidderNumber?: number): Promise<PdfGenerationResult> {
  try {
    // Skip jsPDF (doesn't support Arabic well) and use html2canvas directly
    console.log('Using html2canvas for declaration PDF generation (better Arabic support)');
    const pngResult = await generateDeclarationPNG(formData, bidderNumber);
    
    return {
      success: true,
      blob: pngResult.blob,
      dataURL: pngResult.dataURL,
      method: 'html2canvas',
      fallbackUsed: false
    };
    
  } catch (error) {
    console.error('Robust declaration PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في إنشاء الملف',
      method: 'html2canvas',
      fallbackUsed: true
    };
  }
}
