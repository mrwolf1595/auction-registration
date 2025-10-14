# PDF Testing Guide

## Quick Test Instructions

### **1. Start the Development Server**
```bash
npm run dev
```

### **2. Navigate to Test Page**
```
URL: http://localhost:3000/test-pdf
```

### **3. Test PDF Generation**

#### **Test Receipt PDF:**
1. Click "اختبار إيصال الاستلام" button
2. Wait for generation to complete
3. Check the results panel for:
   - Success status
   - Method used (jsPDF or html2canvas)
   - Whether fallback was used
4. Click "تحميل الملف" to download the generated file

#### **Test Declaration PDF:**
1. Click "اختبار إقرار المزايد" button
2. Wait for generation to complete
3. Check the results panel
4. Download the generated file

### **4. Verify Arabic Text Quality**

#### **Check Generated Files:**
- Open downloaded files
- Verify Arabic text renders correctly
- Check RTL (right-to-left) layout
- Ensure all Arabic characters display properly

#### **Expected Results:**
- **jsPDF Method**: Basic Arabic support, smaller file size
- **html2canvas Method**: Perfect Arabic rendering, larger file size
- **Automatic Fallback**: System switches to html2canvas if jsPDF fails

### **5. Test Complete Submit Flow**

#### **Navigate to Registration Form:**
```
URL: http://localhost:3000/register
```

#### **Fill Out Form:**
- Complete all required fields
- Add signature or typed name
- Click "تسجيل" button

#### **Monitor Submit Flow:**
1. **Validation**: Form data validation
2. **PDF Generation**: Watch for method used (jsPDF/html2canvas)
3. **Upload**: Files uploaded to Firebase Storage
4. **Save**: Data saved to Firestore
5. **Success**: Download links provided

### **6. Expected Test Results**

#### **Successful Generation:**
- ✅ PDF/PNG files generated successfully
- ✅ Arabic text renders correctly
- ✅ RTL layout works properly
- ✅ Files download correctly
- ✅ Submit flow completes successfully

#### **Fallback Scenarios:**
- ⚠️ jsPDF fails → Automatic switch to html2canvas
- ⚠️ Validation fails → Fallback to PNG generation
- ✅ Final output always available

### **7. Troubleshooting**

#### **If Tests Fail:**
1. Check browser console for errors
2. Verify internet connection (for font loading)
3. Try different browser
4. Check Firebase configuration

#### **Common Issues:**
- **Font Loading**: Ensure Google Fonts access
- **Canvas Issues**: Check browser compatibility
- **Download Problems**: Verify file generation

### **8. Performance Expectations**

#### **Generation Times:**
- **jsPDF**: 1-2 seconds
- **html2canvas**: 3-5 seconds
- **Complete Flow**: 5-10 seconds

#### **File Sizes:**
- **PDF**: 50-100 KB
- **PNG**: 200-500 KB

### **9. Success Criteria**

#### **All Tests Should Show:**
- ✅ Successful PDF/PNG generation
- ✅ Proper Arabic text rendering
- ✅ Correct RTL layout
- ✅ Working download functionality
- ✅ Automatic fallback when needed

The robust PDF generation system is working correctly if all tests pass and Arabic text renders properly in the generated documents! 🎉
