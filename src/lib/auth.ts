import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './firebase';

export interface EmployeeUser {
  uid: string;
  email: string;
  displayName?: string;
}

// Sign in employee with email and password
export const signInEmployee = async (email: string, password: string): Promise<EmployeeUser> => {
  if (!auth) {
    throw new Error('Firebase لم يتم تهيئته بشكل صحيح - تحقق من ملف .env.local');
  }
  
  // Validate input
  if (!email || !password) {
    throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
  }
  
  if (!email.includes('@')) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }
  
  try {
    console.log('Attempting to sign in with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Force refresh the token to ensure Firebase rules are applied correctly
    await user.getIdToken(true);
    
    // Log auth state for debugging
    console.log('Auth state after login:', !!auth.currentUser);
    console.log('User UID:', user.uid);
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email!.split('@')[0]
    };
  } catch (error: unknown) {
    console.error('Error signing in employee:', error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code as string : 'unknown';
    
    // Log additional debugging info
    console.error('Error code:', errorCode);
    console.error('Firebase config check:', {
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

// Sign out employee
export const signOutEmployee = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase لم يتم تهيئته بشكل صحيح');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: EmployeeUser | null) => void) => {
  if (!auth) {
    console.error('Firebase لم يتم تهيئته بشكل صحيح');
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split('@')[0]
      });
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentEmployee = (): EmployeeUser | null => {
  if (!auth) {
    return null;
  }
  
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email!.split('@')[0]
    };
  }
  return null;
};

// Get auth error message in Arabic
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'المستخدم غير موجود - تأكد من صحة البريد الإلكتروني';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صحيح';
    case 'auth/invalid-credential':
      return 'بيانات تسجيل الدخول غير صحيحة - تأكد من البريد الإلكتروني وكلمة المرور';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح، حاول مرة أخرى لاحقاً';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالإنترنت';
    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول غير مسموحة - تأكد من تفعيل Email/Password في Firebase';
    default:
      return `حدث خطأ أثناء تسجيل الدخول (${errorCode}) - راجع إعدادات Firebase`;
  }
};
