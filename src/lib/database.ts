import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  onValue,
} from 'firebase/database';
import { database, auth } from './firebase';

export interface Registration {
  id: string;
  bidderName: string;
  idNumber: string;
  phoneNumber: string;
  checkCount: string;
  issuingBank: string;
  cheques: Array<{ number: string; amount: string }>;
  employeeName?: string;
  signature?: string;
  typedName?: string;
  registrationDate: string;
  status: 'pending' | 'completed' | 'customer-uploaded';
  completedBy?: string;
  completedAt?: string;
  auctionId?: string;
  declarationUrl?: string; // رابط الإقرار
  bidderNumber?: number; // رقم المضرب (بدلاً من رقم التسجيل)
  totalAmount?: number; // إجمالي مبلغ الشيكات
}

export interface Auction {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'completed' | 'upcoming';
  description?: string;
}

// Registrations
export interface SaveRegistrationOptions {
  declarationUrl?: string; // رابط الإقرار
  markAsUploaded?: boolean; // تعيين الحالة كـ "customer-uploaded"
}

export const saveRegistration = async (
  registration: Omit<Registration, 'id'>, 
  options?: SaveRegistrationOptions
): Promise<{ id: string; bidderNumber: number }> => {
  if (!database) {
    throw new Error('Firebase Database لم يتم تهيئته بشكل صحيح');
  }
  
  try {
    const registrationsRef = ref(database, 'registrations');
    const newRegistrationRef = push(registrationsRef);
    
    // تعيين الحالة إما كـ pending (افتراضي) أو customer-uploaded
    const status = options?.markAsUploaded ? 'customer-uploaded' : 'pending';
    
    // حساب إجمالي مبلغ الشيكات
    const totalAmount = registration.cheques.reduce((sum, cheque) => {
      const amount = parseFloat(cheque.amount.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0);
    
    // توليد رقم المضرب (1-200)
    const bidderNumber = Math.floor(Math.random() * 200) + 1;
    
    const registrationData = {
      ...registration,
      id: newRegistrationRef.key!,
      registrationDate: new Date().toISOString(),
      status,
      declarationUrl: options?.declarationUrl || null,
      bidderNumber,
      totalAmount
    };
    
    await set(newRegistrationRef, registrationData);
    return { id: newRegistrationRef.key!, bidderNumber };
  } catch (error) {
    console.error('Error saving registration:', error);
    throw new Error('فشل في حفظ التسجيل');
  }
};

export const getRegistrations = async (): Promise<Registration[]> => {
  if (!database) {
    console.warn('Firebase Database لم يتم تهيئته بشكل صحيح');
    return [];
  }
  
  try {
    // Always check authentication status
    if (!auth?.currentUser) {
      console.warn('لم يتم تسجيل دخول المستخدم. قم بتسجيل الدخول أولاً.');
      return [];
    }
    
    // Try to get a fresh token but don't throw if it fails
    try {
      await auth.currentUser.getIdToken(true);
      console.log("Token refreshed successfully");
    } catch (tokenError) {
      console.warn("Failed to refresh token, but continuing:", tokenError);
    }
    
    console.log("Current user authenticated:", !!auth.currentUser);
    
    // Add a delay to ensure the token is processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const registrationsRef = ref(database, 'registrations');
    console.log("Attempting to fetch registrations...");
    const snapshot = await get(registrationsRef);
    
    console.log("Fetch completed, data exists:", snapshot.exists());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Registration[];
    }
    
    return [];
  } catch (error: unknown) {
    console.error('Error getting registrations:', error);
    
    // Check if it's a permission error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PERMISSION_DENIED') {
      console.warn('Permission denied - تأكد من تسجيل دخول الموظف وإعداد قواعد الأمان في Firebase');
      console.warn('اقتراح: جرّب تغيير قواعد الأمان إلى { "rules": { ".read": true, ".write": true } } مؤقتاً للاختبار.');
    }
    
    // Return empty array instead of throwing error
    return [];
  }
};

export const getPendingRegistrations = async (): Promise<Registration[]> => {
  try {
    const registrations = await getRegistrations();
    return registrations.filter(reg => reg.status === 'pending');
  } catch (error) {
    console.error('Error getting pending registrations:', error);
    throw new Error('فشل في جلب التسجيلات المعلقة');
  }
};

export const getCompletedRegistrations = async (): Promise<Registration[]> => {
  try {
    const registrations = await getRegistrations();
    return registrations.filter(reg => reg.status === 'completed');
  } catch (error) {
    console.error('Error getting completed registrations:', error);
    throw new Error('فشل في جلب التسجيلات المكتملة');
  }
};

export const updateRegistrationStatus = async (
  registrationId: string, 
  status: 'pending' | 'completed',
  completedBy?: string
): Promise<void> => {
  if (!database) {
    throw new Error('Firebase Database لم يتم تهيئته بشكل صحيح');
  }
  
  try {
    const registrationRef = ref(database, `registrations/${registrationId}`);
    const updates: {
      status: 'pending' | 'completed';
      completedBy?: string;
      completedAt?: string;
    } = {
      status,
      ...(status === 'completed' && {
        completedBy,
        completedAt: new Date().toISOString()
      })
    };
    
    await update(registrationRef, updates);
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw new Error('فشل في تحديث حالة التسجيل');
  }
};

// Real-time listeners
export const listenToRegistrations = (
  callback: (registrations: Registration[]) => void
): () => void => {
  if (!database) {
    console.error('Firebase Database لم يتم تهيئته بشكل صحيح');
    callback([]);
    return () => {};
  }
  
  // Check authentication
  if (!auth?.currentUser) {
    console.warn('لم يتم تسجيل دخول المستخدم. لا يمكن الاستماع للتسجيلات.');
    callback([]);
    return () => {};
  }
  
  const registrationsRef = ref(database, 'registrations');
  
  const unsubscribe = onValue(registrationsRef, (snapshot) => {
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const registrations = Object.values(data) as Registration[];
        console.log('Real-time registrations update:', registrations.length);
        callback(registrations);
      } else {
        console.log('No registrations found in real-time');
        callback([]);
      }
    } catch (error) {
      console.error('Error in real-time listener:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Real-time listener error:', error);
    callback([]);
  });
  
  return unsubscribe;
};

export const listenToPendingRegistrations = (
  callback: (registrations: Registration[]) => void
): () => void => {
  const unsubscribe = listenToRegistrations((registrations) => {
    const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
    callback(pendingRegistrations);
  });
  
  return unsubscribe;
};

export const listenToCompletedRegistrations = (
  callback: (registrations: Registration[]) => void
): () => void => {
  const unsubscribe = listenToRegistrations((registrations) => {
    const completedRegistrations = registrations.filter(reg => reg.status === 'completed');
    callback(completedRegistrations);
  });
  
  return unsubscribe;
};

// Real-time auction listener
export const listenToAuctions = (
  callback: (auctions: Auction[]) => void
): () => void => {
  if (!database) {
    console.error('Firebase Database لم يتم تهيئته بشكل صحيح');
    callback([]);
    return () => {};
  }
  
  const auctionsRef = ref(database, 'auctions');
  
  const unsubscribe = onValue(auctionsRef, (snapshot) => {
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const auctions = Object.values(data) as Auction[];
        console.log('Real-time auctions update:', auctions.length);
        callback(auctions);
      } else {
        console.log('No auctions found in real-time');
        callback([]);
      }
    } catch (error) {
      console.error('Error in real-time auctions listener:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Real-time auctions listener error:', error);
    callback([]);
  });
  
  return unsubscribe;
};

// Auctions
export const getAuctions = async (): Promise<Auction[]> => {
  if (!database) {
    console.warn('Firebase Database لم يتم تهيئته بشكل صحيح');
    return [];
  }
  
  try {
    // For customers (no auth required), try to fetch auctions directly
    const auctionsRef = ref(database, 'auctions');
    console.log("Attempting to fetch auctions...");
    const snapshot = await get(auctionsRef);
    
    console.log("Auctions fetch completed, data exists:", snapshot.exists());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Auction[];
    }
    
    // Return empty array if no auctions exist
    return [];
  } catch (error: unknown) {
    console.error('Error getting auctions:', error);
    
    // Check if it's a permission error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PERMISSION_DENIED') {
      console.warn('Permission denied - تأكد من إعداد قواعد الأمان في Firebase للسماح بقراءة المزادات');
      console.warn('اقتراح: جرّب تغيير قواعد الأمان إلى { "rules": { "auctions": { ".read": true } } } للسماح بقراءة المزادات للجميع.');
    }
    
    // Return empty array instead of throwing error
    return [];
  }
};

// استيراد التحقق من المستخدمين المعتمدين
import { checkAuthorizedUser } from './authorizedUsers';

export const saveAuction = async (auction: Omit<Auction, 'id'>): Promise<string> => {
  if (!database) {
    throw new Error('Firebase Database لم يتم تهيئته بشكل صحيح');
  }
  
  // التحقق من وجود مستخدم مسجل دخول
  if (!auth?.currentUser) {
    throw new Error('يجب تسجيل دخول الموظف أولاً');
  }
  
  // التحقق من أن المستخدم معتمد
  console.log("جاري التحقق من صلاحية المستخدم لإنشاء مزاد...");
  console.log("البريد الإلكتروني للمستخدم:", auth.currentUser.email);
  
  const isAuthorized = await checkAuthorizedUser();
  console.log("نتيجة التحقق من الصلاحية:", isAuthorized ? "معتمد ✓" : "غير معتمد ✗");
  
  if (!isAuthorized) {
    console.error(`رفض إنشاء المزاد: المستخدم ${auth.currentUser.email} غير مصرح له`);
    throw new Error('غير مصرح لهذا المستخدم بإنشاء المزادات');
  }
  
  console.log("المستخدم مصرح له بإنشاء مزادات ✓");
  
  try {
    const auctionsRef = ref(database, 'auctions');
    const newAuctionRef = push(auctionsRef);
    
    const auctionData = {
      ...auction,
      id: newAuctionRef.key!,
      createdBy: auth.currentUser.email,
      createdAt: new Date().toISOString()
    };
    
    await set(newAuctionRef, auctionData);
    return newAuctionRef.key!;
  } catch (error: unknown) {
    console.error('Error saving auction:', error);
    
    // Check if it's a permission error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PERMISSION_DENIED') {
      throw new Error('خطأ في الصلاحيات - تأكد من تسجيل دخول الموظف وإعداد قواعد الأمان في Firebase');
    }
    
    throw new Error('فشل في حفظ المزاد');
  }
};

