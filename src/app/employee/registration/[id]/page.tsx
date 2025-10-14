'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChange, EmployeeUser } from '@/lib/auth';
import { getRegistrations, updateRegistrationStatus } from '@/lib/database';
import { generateCompressedPDF } from '@/lib/robustPdfGenerator';

import { Registration } from '@/lib/database';

export default function RegistrationDetailPage() {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [employee, setEmployee] = useState<EmployeeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Check if employee is logged in
    const unsubscribe = onAuthStateChange((user: EmployeeUser | null) => {
      if (!user) {
        router.push('/employee/login');
        return;
      }

      setEmployee(user);
      loadRegistration();
    });

    return () => unsubscribe();
  }, [router, params.id]);

  const loadRegistration = async () => {
    try {
      setIsLoading(true);
      
      // Load registrations from Firebase
      const registrations = await getRegistrations();
      const foundRegistration = registrations.find(reg => reg.id === params.id);
      
      if (foundRegistration) {
        setRegistration(foundRegistration);
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Error loading registration:', error);
      router.push('/employee/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!registration || !employee) return;

    setIsGeneratingPDF(true);
    
    try {
      // Update registration with employee name
      const updatedRegistration = {
        ...registration,
        employeeName: employee.displayName
      };

      // Convert Registration to ValidatedFormData format
      const formData = {
        bidderName: updatedRegistration.bidderName,
        idNumber: updatedRegistration.idNumber,
        phoneNumber: updatedRegistration.phoneNumber,
        checkCount: updatedRegistration.checkCount,
        issuingBank: updatedRegistration.issuingBank,
        cheques: updatedRegistration.cheques,
        employeeName: updatedRegistration.employeeName || '',
        signature: updatedRegistration.signature,
        typedName: updatedRegistration.typedName || ''
      };

      // Generate compressed PDF with bidder number
      const result = await generateCompressedPDF(formData, registration.bidderNumber, true);
      
      if (result.blob) {
        // Download the PDF
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${registration.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update registration status in Firebase
        await updateRegistrationStatus(registration.id, 'completed', employee.displayName);

        // Redirect to dashboard
        router.push('/employee/dashboard');
      } else {
        alert('فشل في إنشاء ملف PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white arabic-text">جاري التحميل...</div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white arabic-text">التسجيل غير موجود</div>
      </div>
    );
  }

  // Calculate total amount
  const totalAmount = registration.cheques.reduce((sum, cheque) => {
    return sum + parseFloat(cheque.amount.replace(/,/g, '')) || 0;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/employee/dashboard" 
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-300 arabic-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للوحة التحكم
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent arabic-text mb-4">
            تفاصيل التسجيل
          </h1>
          <p className="text-gray-300 arabic-text">
            مراجعة بيانات المزايد وطباعة الإيصال
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Registration Status */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white arabic-text">
                  {registration.bidderName}
                </h2>
                <p className="text-gray-300 arabic-text">
                  رقم التسجيل: {registration.id}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold arabic-text ${
                registration.status === 'pending' 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {registration.status === 'pending' ? 'في الانتظار' : 'مكتمل'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bidder Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 arabic-text mb-4">
                    بيانات المزايد
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">الاسم:</span>
                      <span className="text-white arabic-text font-medium">{registration.bidderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">رقم الهوية:</span>
                      <span className="text-white arabic-text">{registration.idNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">رقم الجوال:</span>
                      <span className="text-white arabic-text">{registration.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">البنك المصدر:</span>
                      <span className="text-white arabic-text">{registration.issuingBank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">تاريخ التسجيل:</span>
                      <span className="text-white arabic-text">
                        {new Date(registration.registrationDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cheques Information */}
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 arabic-text mb-4">
                    تفاصيل الشيكات
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="space-y-3">
                      {registration.cheques.map((cheque, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                          <div>
                            <span className="text-gray-300 arabic-text">الشيك {index + 1}:</span>
                            <span className="text-white arabic-text mr-2">{cheque.number}</span>
                          </div>
                          <span className="text-white arabic-text font-medium">
                            {parseFloat(cheque.amount.replace(/,/g, '')).toLocaleString()} ريال
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 border-t border-white/20 font-semibold">
                        <span className="text-cyan-300 arabic-text">المجموع الكلي:</span>
                        <span className="text-white arabic-text text-lg">
                          {totalAmount.toLocaleString()} ريال سعودي
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Actions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 arabic-text mb-4">
                    إجراءات الموظف
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300 arabic-text">الموظف المسؤول:</span>
                      <span className="text-white arabic-text">{employee?.displayName}</span>
                    </div>
                    
                    {registration.status === 'pending' ? (
                      <button
                        onClick={handleGenerateReceipt}
                        disabled={isGeneratingPDF}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 arabic-text disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPDF ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            جاري إنشاء ملف PDF...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            طباعة الإيصال (PNG)
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300 arabic-text">تم بواسطة:</span>
                          <span className="text-white arabic-text">{registration.completedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300 arabic-text">تاريخ الإكمال:</span>
                          <span className="text-white arabic-text">
                            {new Date(registration.completedAt!).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center">
                          <p className="text-green-300 arabic-text">
                            تم إكمال التسجيل بنجاح
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature Preview */}
                {registration.signature && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300 arabic-text mb-4">
                      توقيع المزايد
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <img 
                        src={registration.signature} 
                        alt="توقيع المزايد" 
                        className="w-full h-32 object-contain bg-white rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
