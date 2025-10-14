'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChange, EmployeeUser } from '@/lib/auth';
import { addAuthorizedUser, removeAuthorizedUser } from '@/lib/authorizedUsers';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Database } from 'firebase/database';

interface AuthorizedUser {
  uid: string;
  email: string;
  addedAt: string;
  isAuthorized: boolean;
}

export default function AdminPage() {
  const [employee, setEmployee] = useState<EmployeeUser | null>(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  // تحميل قائمة المستخدمين المعتمدين
  const loadAuthorizedUsers = () => {
    if (!database) {
      setMessage({ text: 'لا يمكن الاتصال بقاعدة البيانات', type: 'error' });
      return null;
    }

    try {
      const emailsRef = ref(database as Database, 'authorizedUsersByEmail');
      
      // استخدام onValue للمراقبة المستمرة للتغييرات
      return onValue(emailsRef, (snapshot) => {
        const users: AuthorizedUser[] = [];
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          Object.keys(data).forEach(safeEmailKey => {
            // استعادة البريد الإلكتروني الأصلي من المفتاح الآمن
            const email = safeEmailKey.replace(/_dot_/g, '.').replace(/_at_/g, '@');
            const userData = data[safeEmailKey];
            
            users.push({
              uid: userData.uid || 'غير معروف',
              email,
              addedAt: userData.addedAt || new Date().toISOString(),
              isAuthorized: userData.isAuthorized || false
            });
          });
        }
        
        setAuthorizedUsers(users);
        setIsLoading(false);
      }, (error) => {
        console.error("خطأ في تحميل المستخدمين المعتمدين:", error);
        setMessage({ text: 'خطأ في تحميل المستخدمين المعتمدين', type: 'error' });
        setIsLoading(false);
      });
    } catch (error) {
      console.error("خطأ:", error);
      setMessage({ text: 'خطأ في تحميل المستخدمين المعتمدين', type: 'error' });
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const unsubscribeAuth = onAuthStateChange((user: EmployeeUser | null) => {
      if (!user) {
        router.push('/employee/login');
        return;
      }
      
      // تحقق أن المستخدم هو أحد المستخدمين الرئيسيين فقط (التحكم الأولي المؤقت)
      const superAdmins = ['nassermessi33@gmail.com', 'mrv2194@gmail.com'];
      if (!user.email || !superAdmins.includes(user.email.toLowerCase())) {
        router.push('/employee/dashboard');
        return;
      }
      
      setEmployee(user);
    });
    
    // تحميل المستخدمين المعتمدين
    const unsubscribeDB = loadAuthorizedUsers();
    
    return () => {
      unsubscribeAuth();
      if (typeof unsubscribeDB === 'function') {
        unsubscribeDB();
      }
    };
  }, [router]);

  // إضافة مستخدم معتمد جديد
  const handleAddAuthorizedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ text: 'يرجى إدخال بريد إلكتروني صالح', type: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // استخدام UID وهمي مع البريد الإلكتروني حتى يتم تسجيل دخول المستخدم لأول مرة
      const tempUid = `temp-${new Date().getTime()}`;
      await addAuthorizedUser(tempUid, newEmail);
      
      setNewEmail('');
      setMessage({ text: 'تمت إضافة المستخدم بنجاح', type: 'success' });
    } catch (error) {
      console.error("خطأ في إضافة المستخدم:", error);
      setMessage({ text: 'خطأ في إضافة المستخدم', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // إزالة مستخدم معتمد
  const handleRemoveAuthorizedUser = async (email: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${email} من المستخدمين المعتمدين؟`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      await removeAuthorizedUser(email);
      setMessage({ text: 'تمت إزالة المستخدم بنجاح', type: 'success' });
    } catch (error) {
      console.error("خطأ في إزالة المستخدم:", error);
      setMessage({ text: 'خطأ في إزالة المستخدم', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !employee) {
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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent arabic-text">
              إدارة المستخدمين المعتمدين
            </h1>
            <p className="text-gray-300 arabic-text">
              مرحباً {employee?.displayName}
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/employee/dashboard"
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg transition-all duration-300 arabic-text"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>

        {/* Admin Panel */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-6">
            إضافة مستخدم معتمد جديد
          </h2>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm arabic-text ${
              message.type === 'error' 
                ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                : 'bg-green-500/20 border border-green-500/30 text-green-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add User Form */}
          <form onSubmit={handleAddAuthorizedUser} className="flex gap-4 mb-8">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 arabic-text backdrop-blur-sm"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !newEmail}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 arabic-text disabled:opacity-50"
            >
              إضافة
            </button>
          </form>

          {/* Users List */}
          <h2 className="text-xl font-semibold text-cyan-300 arabic-text mb-4">
            قائمة المستخدمين المعتمدين
          </h2>

          {authorizedUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 arabic-text">لا يوجد مستخدمين معتمدين حاليًا</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-right text-cyan-300 arabic-text">البريد الإلكتروني</th>
                    <th className="py-3 px-4 text-right text-cyan-300 arabic-text">تاريخ الإضافة</th>
                    <th className="py-3 px-4 text-right text-cyan-300 arabic-text">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {authorizedUsers.map((user) => (
                    <tr key={user.email} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white arabic-text">{user.email}</td>
                      <td className="py-3 px-4 text-white arabic-text">
                        {new Date(user.addedAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRemoveAuthorizedUser(user.email)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1 rounded-lg transition-all duration-300 arabic-text text-sm"
                        >
                          إزالة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-cyan-300 arabic-text mb-4">
            تعليمات
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 arabic-text">
            <li>المستخدمون المعتمدون يمكنهم إنشاء المزادات الجديدة</li>
            <li>يمكنك إضافة أو إزالة مستخدمين من هذه القائمة في أي وقت</li>
            <li>عند إضافة مستخدم جديد، يجب إدخال بريده الإلكتروني بشكل صحيح</li>
            <li>للحصول على هذه الصلاحيات، يجب أن تكون مسجل دخول بحساب مدير</li>
          </ul>
        </div>
      </div>
    </div>
  );
}