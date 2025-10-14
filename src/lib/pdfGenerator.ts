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

// Generate receipt PDF using jsPDF
export const generateReceiptPDF = async (formData: ValidatedFormData): Promise<{ blob: Blob; dataURL: string }> => {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Calculate total amount
    const totalAmount = formData.cheques.reduce((sum, cheque) => {
      return sum + parseNumber(cheque.amount || '0');
    }, 0);

    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set font (using default font for now)
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(34, 211, 238); // Cyan color
    doc.text('إيصال استلام', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 20, 35, { align: 'right' });
    
    let yPosition = 50;
    
    // Bidder Information Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247); // Purple color
    doc.text('بيانات المزايد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Bidder Information
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81); // Gray color
    
    const bidderInfo = [
      `اسم المزايد: ${formData.bidderName}`,
      `رقم الهوية: ${formData.idNumber}`,
      `رقم الجوال: ${formData.phoneNumber}`,
      `عدد الشيكات: ${formData.cheques.length}`,
      `البنك المصدر: ${formData.issuingBank}`
    ];
    
    bidderInfo.forEach(info => {
      doc.text(info, 20, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Cheque Details Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('تفاصيل الشيكات', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Cheque Details Table
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    
    // Table header
    doc.setFillColor(34, 211, 238);
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('رقم الشيك', 30, yPosition, { align: 'center' });
    doc.text('المبلغ (ريال سعودي)', 100, yPosition, { align: 'center' });
    doc.text('ملاحظات', 170, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Table rows
    doc.setTextColor(55, 65, 81);
    formData.cheques.forEach((cheque, index) => {
      doc.text(cheque.number, 30, yPosition, { align: 'center' });
      doc.text(formatNumber(cheque.amount), 100, yPosition, { align: 'center' });
      doc.text(`شيك رقم ${index + 1}`, 170, yPosition, { align: 'center' });
      yPosition += 7;
    });
    
    // Total row
    yPosition += 5;
    doc.setFontSize(12);
    doc.setTextColor(168, 85, 247);
    doc.text('المجموع الكلي', 100, yPosition, { align: 'center' });
    doc.setTextColor(34, 211, 238);
    doc.text(`${formatNumber(totalAmount.toString())} ريال سعودي`, 170, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Employee Information Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('بيانات الموظف مستلم الشيك', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Employee Information
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`اسم الموظف: ${formData.employeeName}`, 20, yPosition, { align: 'right' });
    yPosition += 7;
    
    if (formData.signature) {
      doc.text('التوقيع: تم التوقيع', 20, yPosition, { align: 'right' });
      yPosition += 7;
      
      // Add signature image if available
      try {
        const img = new Image();
        img.src = formData.signature;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', 20, yPosition, 50, 20);
            yPosition += 30;
            resolve(void 0);
          };
        });
      } catch (error) {
        console.error('Error adding signature image:', error);
      }
    } else {
      doc.text(`الاسم المطبوع: ${formData.typedName || 'غير محدد'}`, 20, yPosition, { align: 'right' });
      yPosition += 7;
    }
    
    yPosition += 20;
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('تم استلام الشيكات المذكورة أعلاه من المزايد المذكور', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text('جميع الحقوق محفوظة © 2024 نظام تسجيل المزادات', 105, yPosition, { align: 'center' });
    
    // Generate blob and dataURL
    const pdfBlob = doc.output('blob');
    const dataURL = doc.output('dataurlstring');
    
    return {
      blob: pdfBlob,
      dataURL: dataURL
    };
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  }
};

// Fallback PNG generation using html2canvas
export const generateReceiptPNG = async (): Promise<{ blob: Blob; dataURL: string }> => {
  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Find the preview modal element
    const modalElement = document.querySelector('[data-preview-modal]');
    
    if (!modalElement) {
      throw new Error('لم يتم العثور على عنصر المعاينة');
    }
    
    // Capture the modal as canvas
    const canvas = await html2canvas(modalElement as HTMLElement, {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1000
    });
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              blob,
              dataURL: reader.result as string
            });
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/png', 0.95);
    });
  } catch (error) {
    console.error('PNG generation failed:', error);
    throw new Error('فشل في إنشاء صورة PNG');
  }
};

// Session storage for registration numbers to prevent collisions
const usedRegistrationNumbers = new Set<number>();

// Generate unique registration number (1-200)
const generateUniqueRegistrationNumber = (): number => {
  let attempts = 0;
  let number: number;
  
  do {
    number = Math.floor(Math.random() * 200) + 1;
    attempts++;
    
    // Prevent infinite loop
    if (attempts > 200) {
      // Reset the set if all numbers are used
      usedRegistrationNumbers.clear();
      number = Math.floor(Math.random() * 200) + 1;
    }
  } while (usedRegistrationNumbers.has(number));
  
  usedRegistrationNumbers.add(number);
  return number;
};

// Arabic clauses for bidder declaration
const arabicClauses = [
  "أقر وأتعهد بأن جميع البيانات المدخلة في هذا النموذج صحيحة وكاملة ولا تحتوي على أي معلومات خاطئة أو مضللة.",
  "أوافق على المشاركة في المزاد وفقاً للشروط والأحكام المعلنة وأتعهد بالالتزام بها.",
  "أؤكد أنني أملك الأهلية القانونية للمشاركة في المزاد وأنني لست محظوراً من المشاركة في أي مزادات.",
  "أتعهد بدفع جميع الرسوم والمبالغ المطلوبة في المواعيد المحددة وفقاً للشروط المعلنة.",
  "أوافق على أن تكون جميع القرارات المتعلقة بالمزاد نهائية وملزمة ولا يحق لي الاعتراض عليها.",
  "أتعهد بعدم الانسحاب من المزاد بعد تقديم العطاء إلا في الحالات المسموح بها قانوناً.",
  "أؤكد أنني لست في حالة إفلاس أو تصفية وأنني قادر على الوفاء بالتزاماتي المالية.",
  "أوافق على أن يتم استخدام بياناتي الشخصية لأغراض المزاد فقط ووفقاً لسياسة الخصوصية المعلنة.",
  "أتعهد بعدم تقديم أي معلومات كاذبة أو وثائق مزورة وأن جميع المستندات المرفقة أصلية وصحيحة.",
  "أوافق على أن تكون هذه الإقرارات ملزمة قانونياً وأتحمل المسؤولية الكاملة عن أي مخالفة لها."
];

// Generate bidder declaration PDF
export const generateBidderDeclarationPDF = async (formData: ValidatedFormData): Promise<{ blob: Blob; dataURL: string }> => {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    // Generate unique registration number
    const registrationNumber = generateUniqueRegistrationNumber();
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(34, 211, 238); // Cyan color
    doc.text('إقرار المزايد', 105, 20, { align: 'center' });
    
    // Registration number
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247); // Purple color
    doc.text(`رقم التسجيل: ${registrationNumber}`, 20, 35, { align: 'right' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 20, 45, { align: 'right' });
    
    let yPosition = 60;
    
    // Bidder Information Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('بيانات المزايد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Bidder Information
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    
    const bidderInfo = [
      `اسم المزايد: ${formData.bidderName}`,
      `رقم الهوية: ${formData.idNumber}`,
      `رقم الجوال: ${formData.phoneNumber}`,
      `البنك المصدر: ${formData.issuingBank}`
    ];
    
    bidderInfo.forEach(info => {
      doc.text(info, 20, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    yPosition += 15;
    
    // Declaration Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('إقرار وتعهد', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Arabic clauses
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    
    arabicClauses.forEach((clause, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Clause number and text
      const clauseText = `${index + 1}. ${clause}`;
      
      // Split long text into multiple lines if needed
      const maxWidth = 170;
      const lines = doc.splitTextToSize(clauseText, maxWidth);
      
      lines.forEach((line: string) => {
        doc.text(line, 20, yPosition, { align: 'right' });
        yPosition += 6;
      });
      
      yPosition += 3; // Extra space between clauses
    });
    
    yPosition += 20;
    
    // Signature Section
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text('التوقيع', 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Bidder name and signature
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`اسم المزايد: ${formData.bidderName}`, 20, yPosition, { align: 'right' });
    yPosition += 10;
    
    // Signature line
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(1);
    doc.line(20, yPosition, 100, yPosition);
    doc.text('التوقيع', 105, yPosition + 3, { align: 'right' });
    yPosition += 15;
    
    // Add signature image if available
    if (formData.signature) {
      try {
        const img = new Image();
        img.src = formData.signature;
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', 20, yPosition, 60, 25);
            yPosition += 35;
            resolve(void 0);
          };
        });
      } catch (error) {
        console.error('Error adding signature image:', error);
      }
    } else if (formData.typedName) {
      doc.text(`الاسم المطبوع: ${formData.typedName}`, 20, yPosition, { align: 'right' });
      yPosition += 10;
    }
    
    yPosition += 20;
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('أقر المزايد أعلاه بصحة جميع البيانات والتعهدات المذكورة', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text('جميع الحقوق محفوظة © 2024 نظام تسجيل المزادات', 105, yPosition, { align: 'center' });
    
    // Generate blob and dataURL
    const pdfBlob = doc.output('blob');
    const dataURL = doc.output('dataurlstring');
    
    return {
      blob: pdfBlob,
      dataURL: dataURL
    };
  } catch (error) {
    console.error('Bidder declaration PDF generation failed:', error);
    throw new Error('فشل في إنشاء إقرار المزايد');
  }
};

// Generate bidder declaration PNG fallback
export const generateBidderDeclarationPNG = async (formData: ValidatedFormData): Promise<{ blob: Blob; dataURL: string }> => {
  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Create a temporary element for the declaration
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '-9999px';
    tempElement.style.width = '794px'; // A4 width in pixels
    tempElement.style.height = '1123px'; // A4 height in pixels
    tempElement.style.backgroundColor = 'white';
    tempElement.style.padding = '40px';
    tempElement.style.fontFamily = 'Tajawal, Arial, sans-serif';
    tempElement.style.direction = 'rtl';
    tempElement.style.textAlign = 'right';
    tempElement.style.fontSize = '14px';
    tempElement.style.lineHeight = '1.6';
    
    // Generate unique registration number
    const registrationNumber = Math.floor(Math.random() * 200) + 1;
    
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
    
    // Create HTML content for declaration
    tempElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #22d3ee; margin-bottom: 10px;">إقرار المزايد</h1>
        <p style="font-size: 14px; font-weight: bold; color: #333;">رقم التسجيل: ${registrationNumber}</p>
        <p style="font-size: 10px; color: #666; text-align: left;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 10px;">بيانات المزايد</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; font-weight: bold;">اسم المزايد:</td>
            <td style="padding: 5px;">${formData.bidderName}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">رقم الهوية:</td>
            <td style="padding: 5px;">${formData.idNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">رقم الجوال:</td>
            <td style="padding: 5px;">${formData.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">البنك المصدر:</td>
            <td style="padding: 5px;">${formData.issuingBank}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 10px;">إقرار وتعهد</h2>
        <p style="margin-bottom: 10px;">أقر وأتعهد بما يلي:</p>
        ${arabicClauses.map((clause, index) => `
          <p style="margin-bottom: 5px; font-size: 11px;">${index + 1}. ${clause}</p>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #a855f7; margin-bottom: 10px;">توقيع المزايد</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; font-weight: bold;">اسم المزايد:</td>
            <td style="padding: 5px;">${formData.bidderName}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">التوقيع:</td>
            <td style="padding: 5px;">${formData.signature ? 'تم التوقيع' : (formData.typedName || 'لم يتم التوقيع')}</td>
          </tr>
        </table>
        ${formData.signature ? `
          <div style="margin-top: 20px; text-align: center;">
            <img src="${formData.signature}" style="max-width: 200px; max-height: 100px; border: 1px solid #ccc;" />
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(tempElement);
    
    // Capture the element
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Clean up
    document.body.removeChild(tempElement);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const dataURL = canvas.toDataURL('image/png');
          resolve({ blob, dataURL });
        } else {
          throw new Error('فشل في إنشاء صورة PNG');
        }
      }, 'image/png', 0.95);
    });
    
  } catch (error) {
    console.error('Declaration PNG generation error:', error);
    throw new Error('فشل في إنشاء صورة PNG للإقرار');
  }
};

// Download file utility
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
