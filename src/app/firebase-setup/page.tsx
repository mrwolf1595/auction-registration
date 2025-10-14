'use client';

import { useState } from 'react';
import { setupDefaultEmployees, testFirebaseConnection } from '@/lib/firebaseSetup';
import { signInEmployee } from '@/lib/auth';

export default function FirebaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testEmail, setTestEmail] = useState('nassermessi33@gmail.com');
  const [testPassword, setTestPassword] = useState('Mazaad2024!');

  const handleSetupEmployees = async () => {
    setIsLoading(true);
    setMessage('جاري إعداد الموظفين...');
    
    try {
      await setupDefaultEmployees();
      setMessage('✅ تم إعداد الموظفين بنجاح!');
    } catch (error) {
      console.error('Setup error:', error);
      setMessage(`❌ خطأ في الإعداد: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = () => {
    const isConnected = testFirebaseConnection();
    setMessage(isConnected ? '✅ اتصال Firebase يعمل بشكل صحيح' : '❌ مشكلة في اتصال Firebase');
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) {
      setMessage('❌ يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setMessage('جاري اختبار تسجيل الدخول...');
    
    try {
      const user = await signInEmployee(testEmail, testPassword);
      setMessage(`✅ تم تسجيل الدخول بنجاح! المستخدم: ${user.email}`);
    } catch (error: unknown) {
      setMessage(`❌ فشل تسجيل الدخول: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-8 arabic-text">
            إعداد Firebase للمزاد
          </h1>

          {/* Connection Test */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text">
              اختبار الاتصال
            </h2>
            <button
              onClick={handleTestConnection}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors arabic-text"
            >
              اختبار اتصال Firebase
            </button>
          </div>

          {/* Setup Employees */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text">
              إعداد الموظفين الافتراضيين
            </h2>
            <p className="text-gray-300 mb-4 arabic-text">
              سيتم إنشاء الحسابات التالية:
            </p>
            <ul className="text-gray-300 mb-4 arabic-text list-disc list-inside">
              <li>nassermessi33@gmail.com</li>
              <li>mrv2194@gmail.com</li>
            </ul>
            <button
              onClick={handleSetupEmployees}
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg transition-colors arabic-text"
            >
              {isLoading ? 'جاري الإعداد...' : 'إعداد الموظفين'}
            </button>
          </div>

          {/* Test Login */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text">
              اختبار تسجيل الدخول
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2 arabic-text">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2 arabic-text">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                onClick={handleTestLogin}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg transition-colors arabic-text"
              >
                {isLoading ? 'جاري الاختبار...' : 'اختبار تسجيل الدخول'}
              </button>
            </div>
          </div>

          {/* Environment Variables Check */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 arabic-text">
              فحص متغيرات البيئة
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">API Key:</span>
                <span className="text-cyan-300">
                  {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ موجود' : '❌ مفقود'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Auth Domain:</span>
                <span className="text-cyan-300">
                  {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ موجود' : '❌ مفقود'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Project ID:</span>
                <span className="text-cyan-300">
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ موجود' : '❌ مفقود'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Database URL:</span>
                <span className="text-cyan-300">
                  {process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? '✅ موجود' : '❌ مفقود'}
                </span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="p-4 bg-white/10 rounded-lg border border-white/20">
              <p className="text-white arabic-text">{message}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 arabic-text">
              تعليمات الإعداد
            </h3>
            <ol className="text-gray-300 space-y-2 arabic-text list-decimal list-inside">
              <li>تأكد من وجود ملف .env.local في المجلد الجذر</li>
              <li>فعّل Email/Password في Firebase Authentication</li>
              <li>اضغط على &quot;إعداد الموظفين الافتراضيين&quot;</li>
              <li>اختبر تسجيل الدخول</li>
              <li>اذهب إلى /employee/login للاستخدام العادي</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
