'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChange, signOutEmployee, EmployeeUser } from '@/lib/auth';
import { saveAuction, listenToRegistrations, listenToAuctions, Registration, Auction } from '@/lib/database';
import { auth } from '@/lib/firebase';
import { checkAuthorizedUser } from '@/lib/authorizedUsers';
import { useSessionManager } from '@/hooks/useSessionManager';

export default function EmployeeDashboardPage() {
  const [employee, setEmployee] = useState<EmployeeUser | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [newAuction, setNewAuction] = useState({
    name: '',
    date: '',
    description: ''
  });
  const router = useRouter();

  // Session management with 30-minute inactivity timeout
  const sessionStatus = useSessionManager(!!employee, {
    showWarning: true,
    onWarning: () => {
      // Show a toast or notification that session is about to expire
      console.warn('Session expiring in 2 minutes!');
    },
    onLogout: () => {
      // Clean up any local state before logout
      console.log('Logging out due to inactivity...');
    },
    redirectPath: '/employee/login',
  });

  useEffect(() => {
    console.log("Dashboard component mounted");
    
    // Check if employee is logged in
    const unsubscribe = onAuthStateChange((user: EmployeeUser | null) => {
      console.log("Auth state changed:", user ? "User authenticated" : "No user");
      
      if (!user) {
        console.log("No authenticated user, redirecting to login");
        router.push('/employee/login');
        return;
      }

      setEmployee(user);
      console.log("User authenticated, proceeding to load data");
      
      console.log("بدء التحقق من صلاحيات المستخدم...");
      
      // التحقق مما إذا كان المستخدم معتمداً
      checkAuthorizedUser().then(authorized => {
        console.log("نتيجة التحقق من صلاحيات المستخدم:", authorized ? "✅ معتمد" : "❌ غير معتمد");
        console.log("معلومات المستخدم:", user);
        setIsAuthorized(authorized);
      }).catch(error => {
        console.error("خطأ أثناء التحقق من صلاحيات المستخدم:", error);
      });
      
      // Add a delay before loading data to ensure auth token is processed
      setTimeout(() => {
        console.log("جاري تحميل البيانات بعد التأكد من المصادقة");
        loadData();
      }, 2000);
    });

    return () => unsubscribe();
  }, [router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("Starting to load dashboard data...");
      
      // Wait a moment to ensure auth token is fully processed
      // This helps with Firebase auth token propagation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to refresh the token
      if (auth?.currentUser) {
        try {
          console.log("Refreshing auth token before data fetch");
          await auth.currentUser.getIdToken(true);
          console.log("Token refresh successful");
        } catch (tokenError) {
          console.warn("Failed to refresh token:", tokenError);
        }
      } else {
        console.warn("No current user when loading data");
      }
      
      // Load auctions and registrations from Firebase
      console.log("Setting up real-time listeners...");
      
      // Set up real-time listener for auctions
      const unsubscribeAuctions = listenToAuctions((auctionsData) => {
        console.log("Auctions updated in real-time:", auctionsData.length);
        setAuctions(auctionsData);
      });
      
      // Set up real-time listener for registrations
      const unsubscribeRegistrations = listenToRegistrations((registrationsData) => {
        console.log("Registrations updated in real-time:", registrationsData.length);
        setRegistrations(registrationsData);
      });
      
      // Store unsubscribe functions for cleanup
      return () => {
        unsubscribeAuctions();
        unsubscribeRegistrations();
      };
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutEmployee();
      router.push('/employee/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateAuction = async () => {
    if (!newAuction.name || !newAuction.date) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق مرة أخرى من أن المستخدم معتمد
    const isUserAuthorized = await checkAuthorizedUser();
    if (!isUserAuthorized) {
      alert('غير مصرح لك بإنشاء مزادات. فقط المستخدمين المعتمدين يمكنهم إنشاء مزادات.');
      console.error("محاولة إنشاء مزاد من مستخدم غير معتمد");
      return;
    }

    try {
      console.log("جاري إنشاء مزاد جديد...");
      const auctionData = {
        name: newAuction.name,
        date: newAuction.date,
        description: newAuction.description,
        status: 'active' as const
      };

      await saveAuction(auctionData);
      
      // Reset form and reload data
      setNewAuction({ name: '', date: '', description: '' });
      setShowCreateAuction(false);
      await loadData();
      
      alert('تم إنشاء المزاد بنجاح');
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('فشل في إنشاء المزاد');
    }
  };


  const customerUploadedRegistrations = registrations.filter(reg => reg.status === 'customer-uploaded');
  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
  const completedRegistrations = registrations.filter(reg => reg.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white arabic-text">جاري التحميل...</div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent arabic-text">
              لوحة تحكم الموظف
            </h1>
            <p className="text-gray-300 arabic-text">
              مرحباً {employee?.displayName}
            </p>
            {/* Session Status Indicator */}
            {sessionStatus.isActive && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 arabic-text">
                    الجلسة نشطة
                  </span>
                </div>
                {sessionStatus.remainingMinutes <= 5 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded text-xs arabic-text">
                    ستنتهي الجلسة خلال {sessionStatus.remainingMinutes} دقيقة
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            {isAuthorized && (
              <Link
                href="/employee/admin"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg transition-all duration-300 arabic-text"
              >
                إدارة المستخدمين
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-2 rounded-lg transition-all duration-300 arabic-text"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Auction Selection */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-300 arabic-text">
              إدارة المزادات
            </h2>
            {isAuthorized ? (
              <button
                onClick={() => setShowCreateAuction(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 arabic-text"
              >
                إضافة مزاد جديد
              </button>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 py-1 px-3 rounded-lg text-sm">
                غير مصرح لك بإنشاء مزادات
              </div>
            )}
          </div>

          {auctions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 arabic-text mb-4">
                لا توجد مزادات متاحة
              </p>
              
              {isAuthorized ? (
                <button
                  onClick={() => setShowCreateAuction(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 arabic-text"
                >
                  إنشاء أول مزاد
                </button>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 py-2 px-4 rounded-lg mx-auto max-w-md">
                  لا يمكنك إنشاء مزادات. فقط المستخدمين المعتمدين يمكنهم ذلك.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {auctions.map((auction) => (
                <button
                  key={auction.id}
                  onClick={() => setSelectedAuction(auction.id)}
                  className={`p-4 rounded-xl border transition-all duration-300 text-right arabic-text ${
                    selectedAuction === auction.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{auction.name}</h3>
                  <p className="text-sm opacity-75">التاريخ: {auction.date}</p>
                  {auction.description && (
                    <p className="text-xs opacity-60 mt-1">{auction.description}</p>
                  )}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    auction.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    auction.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {auction.status === 'active' ? 'نشط' :
                     auction.status === 'upcoming' ? 'قادم' : 'مكتمل'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAuction && (
          <div className="space-y-8">
            {/* Auction Details */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-4">
                تفاصيل المزاد المحدد
              </h2>
              {(() => {
                const auction = auctions.find(a => a.id === selectedAuction);
                if (!auction) return null;
                
                const today = new Date();
                const auctionDate = new Date(auction.date);
                const isEnded = auctionDate < today;
                const totalRegistrations = registrations.filter(r => r.auctionId === selectedAuction).length;
                const completedRegistrations = registrations.filter(r => r.auctionId === selectedAuction && r.status === 'completed').length;
                const pendingRegistrations = registrations.filter(r => r.auctionId === selectedAuction && r.status === 'pending').length;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-400 arabic-text mb-2">اسم المزاد</h3>
                      <p className="text-white font-semibold arabic-text">{auction.name}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-400 arabic-text mb-2">تاريخ المزاد</h3>
                      <p className="text-white font-semibold arabic-text">{new Date(auction.date).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-400 arabic-text mb-2">إجمالي المسجلين</h3>
                      <p className="text-white font-semibold arabic-text">{totalRegistrations}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-400 arabic-text mb-2">حالة المزاد</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        isEnded ? 'bg-red-500/20 text-red-300' :
                        auction.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {isEnded ? 'منتهي' :
                         auction.status === 'active' ? 'نشط' : 'قادم'}
                      </span>
                    </div>
                    {auction.description && (
                      <div className="md:col-span-2 lg:col-span-4 bg-white/5 border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-gray-400 arabic-text mb-2">وصف المزاد</h3>
                        <p className="text-white arabic-text">{auction.description}</p>
                      </div>
                    )}
                    <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-green-300 arabic-text mb-2">المسجلين المكتملين</h3>
                        <p className="text-green-300 font-bold text-2xl arabic-text">{completedRegistrations}</p>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-yellow-300 arabic-text mb-2">المسجلين غير المكتملين</h3>
                        <p className="text-yellow-300 font-bold text-2xl arabic-text">{pendingRegistrations}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* All Registrations for Selected Auction */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-4">
                جميع المسجلين في المزاد
              </h2>
              {(() => {
                const auctionRegistrations = registrations.filter(r => r.auctionId === selectedAuction);
                
                if (auctionRegistrations.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400 arabic-text">لا توجد تسجيلات لهذا المزاد</p>
                    </div>
                  );
                }
                
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">اسم المزايد</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">رقم الهوية</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">رقم الجوال</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">عدد الشيكات</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">البنك</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">الحالة</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">تم بواسطة</th>
                          <th className="text-right py-3 px-4 text-cyan-300 arabic-text">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auctionRegistrations.map((registration) => (
                          <tr key={registration.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-4 text-white arabic-text">{registration.bidderName}</td>
                            <td className="py-3 px-4 text-gray-300 arabic-text">{registration.idNumber}</td>
                            <td className="py-3 px-4 text-gray-300 arabic-text">{registration.phoneNumber}</td>
                            <td className="py-3 px-4 text-gray-300 arabic-text">{registration.checkCount}</td>
                            <td className="py-3 px-4 text-gray-300 arabic-text">{registration.issuingBank}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                registration.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {registration.status === 'completed' ? 'مكتمل' : 'غير مكتمل'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-300 arabic-text">
                              {registration.completedBy || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {registration.status === 'pending' ? (
                                <Link
                                  href={`/employee/registration/${registration.id}`}
                                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 arabic-text text-sm"
                                >
                                  مراجعة
                                </Link>
                              ) : (
                                <span className="text-green-300 arabic-text text-sm">مكتمل</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Registrations */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-4">
                  المسجلين غير المكتملين ({pendingRegistrations.length})
                </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingRegistrations.map((registration) => (
                  <div key={registration.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white arabic-text">
                        {registration.bidderName}
                      </h3>
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs arabic-text">
                        في الانتظار
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 arabic-text">
                      <p><span className="text-cyan-300">الهوية:</span> {registration.idNumber}</p>
                      <p><span className="text-cyan-300">الجوال:</span> {registration.phoneNumber}</p>
                      <p><span className="text-cyan-300">عدد الشيكات:</span> {registration.checkCount}</p>
                      <p><span className="text-cyan-300">البنك:</span> {registration.issuingBank}</p>
                    </div>
                    <Link
                      href={`/employee/registration/${registration.id}`}
                      className="block w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 arabic-text text-center"
                    >
                      مراجعة وطباعة الإيصال
                    </Link>
                  </div>
                ))}
                {pendingRegistrations.length === 0 && (
                  <p className="text-gray-400 arabic-text text-center py-8">
                    لا توجد تسجيلات في الانتظار
                  </p>
                )}
              </div>
            </div>

            {/* Customer Uploaded Registrations - قسم جديد */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl mb-8">
              <h2 className="text-xl font-semibold text-amber-300 arabic-text mb-4">
                تسجيلات مرفوعة من العملاء ({customerUploadedRegistrations.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {customerUploadedRegistrations.map((registration) => (
                  <div key={registration.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white arabic-text">
                        {registration.bidderName}
                      </h3>
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full text-xs arabic-text">
                        بانتظار المراجعة
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 arabic-text">
                      <p><span className="text-amber-300">الهوية:</span> {registration.idNumber}</p>
                      <p><span className="text-amber-300">الجوال:</span> {registration.phoneNumber}</p>
                      <p><span className="text-amber-300">عدد الشيكات:</span> {registration.checkCount}</p>
                      <p><span className="text-amber-300">البنك:</span> {registration.issuingBank}</p>
                      {registration.declarationUrl && (
                        <div className="mt-2">
                          <a 
                            href={registration.declarationUrl}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-amber-300 hover:text-amber-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            عرض الإقرار المرفوع
                          </a>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/employee/registration/${registration.id}`}
                      className="block w-full mt-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 arabic-text text-center"
                    >
                      مراجعة وطباعة الإيصال
                    </Link>
                  </div>
                ))}
                {customerUploadedRegistrations.length === 0 && (
                  <p className="text-gray-400 arabic-text text-center py-8">
                    لا توجد تسجيلات مرفوعة من العملاء
                  </p>
                )}
              </div>
            </div>

            {/* Completed Registrations */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-4">
                المسجلين المكتملين ({completedRegistrations.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {completedRegistrations.map((registration) => (
                  <div key={registration.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white arabic-text">
                        {registration.bidderName}
                      </h3>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs arabic-text">
                        مكتمل
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 arabic-text">
                      <p><span className="text-cyan-300">الهوية:</span> {registration.idNumber}</p>
                      <p><span className="text-cyan-300">الجوال:</span> {registration.phoneNumber}</p>
                      <p><span className="text-cyan-300">عدد الشيكات:</span> {registration.checkCount}</p>
                      <p><span className="text-cyan-300">البنك:</span> {registration.issuingBank}</p>
                      <p><span className="text-cyan-300">تم بواسطة:</span> {registration.completedBy}</p>
                      <p><span className="text-cyan-300">تاريخ الإكمال:</span> {
                        new Date(registration.completedAt!).toLocaleDateString('ar-SA')
                      }</p>
                    </div>
                  </div>
                ))}
                {completedRegistrations.length === 0 && (
                  <p className="text-gray-400 arabic-text text-center py-8">
                    لا توجد تسجيلات مكتملة
                  </p>
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {!selectedAuction && (
          <div className="text-center py-12">
            <p className="text-gray-400 arabic-text text-lg">
              يرجى اختيار مزاد لعرض التسجيلات
            </p>
          </div>
        )}

        {/* Create Auction Modal */}
        {showCreateAuction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-slate-800/90 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md">
              <h3 className="text-2xl font-bold text-cyan-300 arabic-text mb-6 text-center">
                إنشاء مزاد جديد
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 arabic-text mb-2">
                    اسم المزاد
                  </label>
                  <input
                    type="text"
                    value={newAuction.name}
                    onChange={(e) => setNewAuction({...newAuction, name: e.target.value})}
                    placeholder="أدخل اسم المزاد"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-300 arabic-text mb-2">
                    تاريخ المزاد
                  </label>
                  <input
                    type="date"
                    value={newAuction.date}
                    onChange={(e) => setNewAuction({...newAuction, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-300 arabic-text mb-2">
                    وصف المزاد (اختياري)
                  </label>
                  <textarea
                    value={newAuction.description}
                    onChange={(e) => setNewAuction({...newAuction, description: e.target.value})}
                    placeholder="أدخل وصف المزاد"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateAuction(false)}
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 px-4 py-3 rounded-xl transition-all duration-300 arabic-text"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateAuction}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 arabic-text"
                >
                  إنشاء المزاد
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
