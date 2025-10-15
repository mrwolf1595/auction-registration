'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { saveRegistration, listenToAuctions, getAuctions } from '@/lib/database';
import { ValidatedFormData } from '@/lib/validation';
import SubmitFlowModal from '@/components/SubmitFlowModal';
import SignatureCanvas, { SignatureCanvasRef } from '@/components/SignatureCanvas';
import toast, { Toaster } from 'react-hot-toast';

// Saudi Banks data
const saudiBanks = [
  'البنك الأهلي السعودي',
  'بنك الراجحي',
  'البنك السعودي الفرنسي',
  'بنك ساب',
  'البنك السعودي للاستثمار',
  'بنك الجزيرة',
  'البنك السعودي الهولندي',
  'بنك الإنماء',
  'البنك السعودي البريطاني',
  'بنك الخليج الدولي',
  'البنك العربي الوطني',
  'بنك الرياض',
  'البنك السعودي الألماني',
  'بنك الإمارات دبي الوطني',
  'البنك السعودي الكويتي'
];


export default function RegisterPage() {
  const router = useRouter();
  const [availableAuctions, setAvailableAuctions] = useState<unknown[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<unknown | null>(null);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [isSubmitFlowOpen, setIsSubmitFlowOpen] = useState(false);
  const [bidderNumber, setBidderNumber] = useState<number | undefined>(undefined);
  const [signature, setSignature] = useState<string>('');
  const [isSignatureValid, setIsSignatureValid] = useState(false);
  const [submittedFormData, setSubmittedFormData] = useState<ValidatedFormData | null>(null);
  const signatureRef = useRef<SignatureCanvasRef>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ValidatedFormData>();

  const checkCount = watch('checkCount', '1');
  const checkCountNum = parseInt(checkCount) || 1;

  // دالة لتنسيق الأرقام بفواصل
  const formatNumber = (value: string) => {
    // إزالة جميع الأحرف غير الرقمية
    const numbers = value.replace(/\D/g, '');
    // إضافة فواصل كل 3 أرقام
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // دالة لإزالة الفواصل من الأرقام
  const removeCommas = (value: string) => {
    return value.replace(/,/g, '');
  };

  // حساب المجموع الكلي لمبالغ الشيكات
  const calculateTotalAmount = () => {
    let total = 0;
    for (let i = 1; i <= checkCountNum; i++) {
      const amount = watch(`chequeAmount${i}` as keyof ValidatedFormData) as string;
      if (amount) {
        const numericAmount = parseFloat(removeCommas(amount)) || 0;
        total += numericAmount;
      }
    }
    return total;
  };

  const totalAmount = calculateTotalAmount();

  // Load auctions in real-time with fallback
  useEffect(() => {
    console.log('Setting up real-time auctions listener...');
    setIsLoadingAuctions(true);

    const unsubscribeAuctions = listenToAuctions((auctions) => {
      console.log('All auctions loaded in real-time:', auctions);
      
      // Filter for active/upcoming auctions
      // Users can only register BEFORE the auction day (not on the auction day itself)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const availableAuctions = auctions.filter((auction: unknown) => {
        const auctionData = auction as { date: string; status: string; name: string };
        const auctionDate = new Date(auctionData.date);
        auctionDate.setHours(0, 0, 0, 0);
        
        // Allow registration only if auction date is AFTER today (not on the same day)
        return auctionDate > today && auctionData.status === 'active';
      });
      
      console.log('Available auctions:', availableAuctions);
      setAvailableAuctions(availableAuctions);
      
      if (availableAuctions.length > 0) {
        setSelectedAuction(availableAuctions[0]);
      }
      
      setIsLoadingAuctions(false);
    });

    // Fallback: try to load auctions directly if real-time fails
    const loadAuctionsFallback = async () => {
      try {
        const auctions = await getAuctions();
        if (auctions.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const availableAuctions = auctions.filter((auction) => {
            const auctionDate = new Date(auction.date);
            auctionDate.setHours(0, 0, 0, 0);
            // Allow registration only if auction date is AFTER today (not on the same day)
            return auctionDate > today && auction.status === 'active';
          });
          
          setAvailableAuctions(availableAuctions);
          if (availableAuctions.length > 0) {
            setSelectedAuction(availableAuctions[0]);
          }
        }
        setIsLoadingAuctions(false);
      } catch (error) {
        console.error('Error loading auctions:', error);
        setIsLoadingAuctions(false);
      }
    };

    // Set timeout to try fallback if real-time doesn't work
    const fallbackTimeout = setTimeout(loadAuctionsFallback, 3000);

    return () => {
      unsubscribeAuctions();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const onSubmit = async (data: ValidatedFormData) => {
    // التحقق من وجود توقيع رقمي فقط
    if (!signature) {
      toast.error('يرجى التوقيع على النموذج للمتابعة', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: '#fff',
          fontFamily: 'Tajawal, sans-serif',
          fontSize: '16px',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      return;
    }

    if (!selectedAuction) {
      toast.error('يرجى اختيار مزاد للمشاركة', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: '#fff',
          fontFamily: 'Tajawal, sans-serif',
          fontSize: '16px',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      return;
    }

    try {
      const auctionData = selectedAuction as { id: string; name: string; date: string };
      
      // Additional validation: Check if auction date is not today or in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const auctionDate = new Date(auctionData.date);
      auctionDate.setHours(0, 0, 0, 0);
      
      if (auctionDate <= today) {
        toast.error('عذراً، لا يمكن التسجيل في يوم المزاد أو بعده. التسجيل متاح فقط قبل يوم المزاد.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#dc2626',
            color: '#fff',
            fontFamily: 'Tajawal, sans-serif',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
          },
        });
        return;
      }
      
      // تحضير بيانات التسجيل - التوقيع الرقمي فقط
      const registrationData = {
        bidderName: data.bidderName,
        idNumber: data.idNumber,
        phoneNumber: data.phoneNumber,
        checkCount: data.checkCount,
        issuingBank: data.issuingBank,
        cheques: Array.from({ length: checkCountNum }, (_, index) => ({
          number: data[`chequeNumber${index + 1}` as keyof ValidatedFormData] as string,
          amount: removeCommas(data[`chequeAmount${index + 1}` as keyof ValidatedFormData] as string)
        })),
        signature, // التوقيع الرقمي فقط
        registrationDate: new Date().toISOString(),
        status: 'pending' as const,
        auctionId: auctionData.id,
        employeeName: 'غير محدد' // سيتم تحديده من قبل الموظف لاحقاً
      };

      // حفظ التسجيل في قاعدة البيانات
      const result = await saveRegistration(registrationData);
      console.log('Registration saved with ID:', result.id, 'Bidder Number:', result.bidderNumber);
      console.log('Signature (Canvas):', signature ? 'موجود' : 'غير موجود');
      
      // تحضير البيانات للـ PDF - التوقيع الرقمي فقط
      const pdfFormData = {
        bidderName: data.bidderName,
        idNumber: data.idNumber,
        phoneNumber: data.phoneNumber,
        checkCount: data.checkCount,
        issuingBank: data.issuingBank,
        signature: signature, // التوقيع الرقمي - مهم جداً!
        employeeName: 'غير محدد', // يتم تحديثه لاحقاً
        cheques: Array.from({ length: checkCountNum }, (_, index) => ({
          number: data[`chequeNumber${index + 1}` as keyof ValidatedFormData] as string,
          amount: removeCommas(data[`chequeAmount${index + 1}` as keyof ValidatedFormData] as string)
        }))
      };
      
      console.log('PDF Form Data prepared with signature:', signature ? 'Yes ✅' : 'No ❌');
      console.log('Signature data length:', signature?.length || 0);
      
      // تعيين رقم المضرب وفتح نافذة التدفق
      setBidderNumber(result.bidderNumber);
      setSubmittedFormData(pdfFormData);
      setIsSubmitFlowOpen(true);
    } catch (error) {
      console.error('Error saving registration:', error);
      toast.error('حدث خطأ في حفظ التسجيل. يرجى المحاولة مرة أخرى.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: '#fff',
          fontFamily: 'Tajawal, sans-serif',
          fontSize: '16px',
          padding: '16px',
          borderRadius: '12px',
        },
      });
    }
  };

  const handleNewRegistration = () => {
    setIsSubmitFlowOpen(false);
    setBidderNumber(undefined);
    setSignature('');
    setIsSignatureValid(false);
    setSubmittedFormData(null);
    router.push('/register');
  };

  // No longer needed - removed sample auction function

  if (isLoadingAuctions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-xl text-white arabic-text">جاري تحميل المزادات...</p>
        </div>
      </div>
    );
  }

  // Set flag to disable form when no auctions available
  const noAuctionsAvailable = availableAuctions.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 arabic-text">
            تسجيل المزاد
          </h1>
          <p className="text-xl text-gray-300 arabic-text max-w-2xl mx-auto">
            انضم إلى عالم المزادات الرقمية وابدأ رحلتك في عالم التداول المتطور
          </p>
        </div>

        {/* Toast Container */}
        <Toaster position="top-center" reverseOrder={false} />

        {/* Warning Message when no auctions available */}
        {noAuctionsAvailable && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="backdrop-blur-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/30 rounded-xl">
                    <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white arabic-text mb-3">
                    عذراً، انتهى التسجيل للمزاد
                  </h3>
                  <p className="text-white/90 arabic-text leading-relaxed text-lg mb-4">
                    يرجى متابعتنا لمزيد من المزادات القادمة. للمزيد من المعلومات، يرجى التواصل على الرقم التالي:
                  </p>
                  <a 
                    href="tel:0563859600" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-2xl tracking-wider">0563859600</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Glassmorphism Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${noAuctionsAvailable ? 'from-gray-500 to-gray-600' : 'from-cyan-500 to-purple-500'} rounded-2xl mb-4 shadow-lg`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white arabic-text">
                نموذج التسجيل
              </h2>
              <p className={`arabic-text mt-2 ${noAuctionsAvailable ? 'text-gray-400' : 'text-gray-300'}`}>
                {noAuctionsAvailable ? 'التسجيل غير متاح حالياً' : 'املأ البيانات التالية للمشاركة في المزاد'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Auction Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 arabic-text">
                  المزاد المختار *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <select
                    {...register('auction', { required: 'يرجى اختيار مزاد' })}
                    value={selectedAuction ? (selectedAuction as { id: string }).id : ''}
                    onChange={(e) => {
                      const auction = availableAuctions.find(a => (a as { id: string }).id === e.target.value);
                      setSelectedAuction(auction || null);
                    }}
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none arabic-text appearance-none disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-slate-800 text-white">
                      {noAuctionsAvailable ? 'لا توجد مزادات متاحة حالياً' : 'اختر المزاد'}
                    </option>
                    {availableAuctions.map((auction) => {
                      const auctionData = auction as { id: string; name: string; date: string };
                      return (
                        <option key={auctionData.id} value={auctionData.id} className="bg-slate-800 text-white">
                          {auctionData.name} - {new Date(auctionData.date).toLocaleDateString('ar-SA')}
                        </option>
                      );
                    })}
                  </select>
                  <div className="px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.auction && (
                  <p className="text-red-400 text-sm arabic-text">{errors.auction?.message}</p>
                )}
              </div>

              {/* Bidder Name */}
              <div className="space-y-2">
                <label htmlFor="bidderName" className="block text-sm font-medium text-cyan-300 arabic-text">
                  اسم المزايد *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    {...register('bidderName', { 
                      required: 'اسم المزايد مطلوب',
                      minLength: { value: 2, message: 'يجب أن يكون الاسم أكثر من حرفين' }
                    })}
                    type="text"
                    id="bidderName"
                    placeholder="أدخل اسمك الكامل"
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none arabic-text disabled:cursor-not-allowed"
                  />
                  <div className="px-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.bidderName && (
                  <p className="text-red-400 text-sm arabic-text">{errors.bidderName?.message}</p>
                )}
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <label htmlFor="idNumber" className="block text-sm font-medium text-cyan-300 arabic-text">
                  رقم الهوية *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    {...register('idNumber', { 
                      required: 'رقم الهوية مطلوب',
                      pattern: { 
                        value: /^[0-9]{10}$/, 
                        message: 'رقم الهوية يجب أن يكون 10 أرقام' 
                      }
                    })}
                    type="text"
                    id="idNumber"
                    placeholder="أدخل رقم الهوية (10 أرقام)"
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none arabic-text disabled:cursor-not-allowed"
                  />
                  <div className="px-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                </div>
                {errors.idNumber && (
                  <p className="text-red-400 text-sm arabic-text">{errors.idNumber?.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-cyan-300 arabic-text">
                  رقم الجوال *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    {...register('phoneNumber', { 
                      required: 'رقم الجوال مطلوب',
                      pattern: { 
                        value: /^05[0-9]{8}$/, 
                        message: 'رقم الجوال يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام' 
                      }
                    })}
                    type="tel"
                    id="phoneNumber"
                    placeholder="05xxxxxxxx"
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none arabic-text disabled:cursor-not-allowed"
                  />
                  <div className="px-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm arabic-text">{errors.phoneNumber?.message}</p>
                )}
              </div>


              {/* Check Count */}
              <div className="space-y-2">
                <label htmlFor="checkCount" className="block text-sm font-medium text-cyan-300 arabic-text">
                  عدد الشيكات *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <select
                    {...register('checkCount', { required: 'عدد الشيكات مطلوب' })}
                    id="checkCount"
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none arabic-text appearance-none disabled:cursor-not-allowed"
                  >
                    <option value="1" className="bg-slate-800 text-white">1 شيك</option>
                    <option value="2" className="bg-slate-800 text-white">2 شيك</option>
                    <option value="3" className="bg-slate-800 text-white">3 شيكات</option>
                    <option value="4" className="bg-slate-800 text-white">4 شيكات</option>
                    <option value="5" className="bg-slate-800 text-white">5 شيكات</option>
                  </select>
                  <div className="px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.checkCount && (
                  <p className="text-red-400 text-sm arabic-text">{errors.checkCount?.message}</p>
                )}
              </div>

              {/* Issuing Bank */}
              <div className="space-y-2">
                <label htmlFor="issuingBank" className="block text-sm font-medium text-cyan-300 arabic-text">
                  البنك المصدر للشيك *
                </label>
                <div className={`flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all duration-300 backdrop-blur-sm ${noAuctionsAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <select
                    {...register('issuingBank', { required: 'البنك المصدر مطلوب' })}
                    id="issuingBank"
                    disabled={noAuctionsAvailable}
                    className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none arabic-text appearance-none disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-slate-800 text-white">اختر البنك</option>
                    {saudiBanks.map((bank, index) => (
                      <option key={index} value={bank} className="bg-slate-800 text-white">
                        {bank}
                      </option>
                    ))}
                  </select>
                  <div className="px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.issuingBank && (
                  <p className="text-red-400 text-sm arabic-text">{errors.issuingBank?.message}</p>
                )}
              </div>

              {/* Cheque Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-300 arabic-text">تفاصيل الشيكات</h3>
                {Array.from({ length: checkCountNum }, (_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-cyan-300 arabic-text">
                        رقم الشيك {index + 1} *
                      </label>
                      <input
                        {...register(`chequeNumber${index + 1}` as keyof ValidatedFormData, { 
                          required: `رقم الشيك ${index + 1} مطلوب` 
                        })}
                        type="text"
                        placeholder="رقم الشيك"
                        disabled={noAuctionsAvailable}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {errors[`chequeNumber${index + 1}` as keyof typeof errors] && (
                        <p className="text-red-400 text-sm arabic-text">
                          {(errors[`chequeNumber${index + 1}` as keyof typeof errors] as { message?: string })?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-cyan-300 arabic-text">
                        مبلغ الشيك {index + 1} (ريال) *
                      </label>
                      <Controller
                        name={`chequeAmount${index + 1}` as keyof ValidatedFormData}
                        control={control}
                        rules={{
                          required: `مبلغ الشيك ${index + 1} مطلوب`,
                          pattern: {
                            value: /^[0-9,]+$/,
                            message: 'يجب أن يحتوي المبلغ على أرقام فقط'
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="0"
                            disabled={noAuctionsAvailable}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-60"
                            value={field.value ? formatNumber(field.value as string) : ''}
                            onChange={(e) => {
                              const formatted = formatNumber(e.target.value);
                              field.onChange(removeCommas(formatted));
                            }}
                          />
                        )}
                      />
                      {errors[`chequeAmount${index + 1}` as keyof typeof errors] && (
                        <p className="text-red-400 text-sm arabic-text">
                          {(errors[`chequeAmount${index + 1}` as keyof typeof errors] as { message?: string })?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* عرض المجموع الكلي */}
                {totalAmount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-green-300 arabic-text">
                            {checkCountNum === 1 ? 'المبلغ الإجمالي' : 'المجموع الكلي'}
                          </h4>
                          <p className="text-sm text-gray-300 arabic-text">
                            {checkCountNum === 1 ? 'مبلغ الشيك الواحد' : 'إجمالي مبالغ جميع الشيكات'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400 arabic-text">
                          {formatNumber(totalAmount.toString())} ريال
                        </p>
                        <p className="text-sm text-gray-400 arabic-text">
                          {checkCountNum === 1 ? 'شيك واحد' : `${checkCountNum} شيك`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-cyan-300 arabic-text">
                  التوقيع أو الاسم المطبوع *
                </label>
                <div className={`bg-white/5 rounded-xl border border-white/10 p-4 space-y-4 ${noAuctionsAvailable ? 'opacity-50' : ''}`}>
                  {/* Signature Canvas */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-300 arabic-text">التوقيع الرقمي:</p>
                      <button
                        type="button"
                        disabled={noAuctionsAvailable}
                        onClick={() => {
                          signatureRef.current?.clear();
                          setSignature('');
                          setIsSignatureValid(false);
                        }}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200 text-sm arabic-text disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        مسح التوقيع
                      </button>
                    </div>
                    <div className={`${noAuctionsAvailable ? 'pointer-events-none' : ''}`}>
                      <SignatureCanvas
                        ref={signatureRef}
                        onSignatureChange={(signatureData: string) => {
                          if (noAuctionsAvailable) return;
                          console.log('Signature received:', signatureData ? 'Has data' : 'Empty');
                          
                          // التحقق من أن التوقيع ليس فارغاً (ليس canvas فارغ)
                          const isBlank = !signatureData || signatureData.endsWith('AAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
                          
                          if (!isBlank) {
                            setSignature(signatureData);
                            setIsSignatureValid(true);
                          } else {
                            setSignature('');
                            setIsSignatureValid(false);
                          }
                        }}
                        width={600}
                        height={200}
                        className="w-full h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-crosshair"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 arabic-text">
                    {noAuctionsAvailable ? '⚠️ التسجيل غير متاح حالياً' : isSignatureValid ? '✅ تم التوقيع بنجاح' : 'يرجى التوقيع لإتمام التسجيل'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !isSignatureValid || noAuctionsAvailable}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 arabic-text"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        تسجيل المشاركة
                      </>
                    )}
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSignature('');
                    setIsSignatureValid(false);
                    if (signatureRef.current) {
                      signatureRef.current.clear();
                    }
                    // مسح الاسم المطبوع أيضاً
                    const typedNameInput = document.querySelector('input[name="typedName"]') as HTMLInputElement;
                    if (typedNameInput) {
                      typedNameInput.value = '';
                    }
                    // إعادة تعيين النموذج
                    setValue('typedName', '');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 arabic-text backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    مسح التوقيع والاسم
                  </span>
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-400 arabic-text">
                جميع البيانات محمية ومشفرة وفقاً لأعلى معايير الأمان
              </p>
            </div>
          </div>
        </div>
      </div>

       {/* Submit Flow Modal */}
       {isSubmitFlowOpen && submittedFormData && (
         <SubmitFlowModal
           isOpen={isSubmitFlowOpen}
           onClose={() => setIsSubmitFlowOpen(false)}
           onNewRegistration={handleNewRegistration}
           formData={submittedFormData}
           isEmployeePage={false}
           bidderNumber={bidderNumber}
         />
       )}
    </div>
  );
}