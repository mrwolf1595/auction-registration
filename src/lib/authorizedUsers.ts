// src/lib/authorizedUsers.ts
import { ref, get, set } from 'firebase/database';
import { database, auth } from './firebase';
import { Database } from 'firebase/database';

/**
 * التحقق مما إذا كان المستخدم الحالي معتمدًا لإنشاء المزادات
 * يتم التحقق من قاعدة البيانات بدلاً من قائمة ثابتة للسماح بإدارة ديناميكية للمستخدمين المصرح لهم
 * @returns {Promise<boolean>} إذا كان المستخدم معتمدًا
 */
export const checkAuthorizedUser = async (): Promise<boolean> => {
  if (!auth?.currentUser) {
    console.log("لا يوجد مستخدم مسجل دخول");
    return false;
  }
  
  // التحقق من وجود قاعدة البيانات
  if (!database) {
    console.error("قاعدة البيانات غير متوفرة");
    return false;
  }
  
  // اختبار ما إذا كان المستخدم موجود في قاعدة البيانات كمستخدم معتمد
  try {
    console.log("البريد الإلكتروني للمستخدم الحالي:", auth.currentUser.email);
    
    // 1. التحقق بواسطة البريد الإلكتروني في قاعدة البيانات
    if (auth.currentUser.email) {
      const userEmail = auth.currentUser.email.toLowerCase();
      
      // تحويل البريد الإلكتروني إلى مفتاح صالح في Firebase بإزالة النقاط واستبدال @ بـ _at_
      const safeEmailKey = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
      
      // البحث في جدول المستخدمين المعتمدين بالبريد الإلكتروني
      const emailRef = ref(database as Database, `authorizedUsersByEmail/${safeEmailKey}`);
      const emailSnapshot = await get(emailRef);
      
      if (emailSnapshot.exists()) {
        console.log("المستخدم معتمد (وجد بالبريد الإلكتروني) ✅");
        return true;
      }
      
      // 2. التحقق بواسطة UID في قاعدة البيانات
      const userRef = ref(database as Database, `authorizedUsers/${auth.currentUser.uid}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if (userData.isAuthorized === true) {
          console.log("المستخدم معتمد (وجد بواسطة UID) ✅");
          return true;
        }
      }
      
      // إذا لم نجد المستخدم في قاعدة البيانات، نتحقق من القائمة المؤقتة
      // هذا للدعم المؤقت خلال الانتقال للنظام الجديد
      const temporaryAuthorizedEmails = [
        'nassermessi33@gmail.com',
        'mrv2194@gmail.com'
      ];
      
      const isInTemporaryList = temporaryAuthorizedEmails.some(email => email.toLowerCase() === userEmail);
      
      if (isInTemporaryList) {
        console.log("المستخدم معتمد (في القائمة المؤقتة)، جاري إضافته لقاعدة البيانات ✅");
        
        // إضافة المستخدم لقاعدة البيانات للمرات القادمة
        await addAuthorizedUser(auth.currentUser.uid, userEmail);
        
        return true;
      }
    }
  } catch (error) {
    console.error("خطأ في التحقق من صلاحية المستخدم:", error);
  }
  
  console.log("المستخدم غير معتمد ❌");
  return false;
};

/**
 * إضافة مستخدم جديد لقائمة المستخدمين المصرح لهم
 * @param uid معرف المستخدم الفريد
 * @param email البريد الإلكتروني للمستخدم
 * @returns وعد يشير إلى نجاح العملية
 */
export const addAuthorizedUser = async (uid: string, email: string): Promise<boolean> => {
  if (!database) {
    console.error("قاعدة البيانات غير متوفرة");
    return false;
  }
  
  try {
    // إضافة بواسطة UID
    const userRef = ref(database as Database, `authorizedUsers/${uid}`);
    await set(userRef, {
      email: email.toLowerCase(),
      isAuthorized: true,
      addedAt: new Date().toISOString()
    });
    
    // تحويل البريد الإلكتروني إلى مفتاح صالح في Firebase بإزالة النقاط واستبدال @ بـ _at_
    const safeEmailKey = email.toLowerCase().replace(/\./g, '_dot_').replace(/@/g, '_at_');
    
    // إضافة بواسطة البريد الإلكتروني (للبحث السريع)
    const emailRef = ref(database as Database, `authorizedUsersByEmail/${safeEmailKey}`);
    await set(emailRef, {
      uid,
      isAuthorized: true,
      addedAt: new Date().toISOString()
    });
    
    console.log("تمت إضافة المستخدم لقائمة المصرح لهم بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في إضافة المستخدم لقائمة المصرح لهم:", error);
    return false;
  }
};

/**
 * إزالة مستخدم من قائمة المستخدمين المصرح لهم
 * @param email البريد الإلكتروني للمستخدم
 * @returns وعد يشير إلى نجاح العملية
 */
export const removeAuthorizedUser = async (email: string): Promise<boolean> => {
  if (!database) {
    console.error("قاعدة البيانات غير متوفرة");
    return false;
  }
  
  try {
    // تحويل البريد الإلكتروني إلى مفتاح صالح في Firebase بإزالة النقاط واستبدال @ بـ _at_
    const safeEmailKey = email.toLowerCase().replace(/\./g, '_dot_').replace(/@/g, '_at_');
    
    // التحقق أولاً من وجود المستخدم في القائمة
    const emailRef = ref(database as Database, `authorizedUsersByEmail/${safeEmailKey}`);
    const snapshot = await get(emailRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // إزالة من قائمة UID
      if (userData.uid) {
        const userRef = ref(database as Database, `authorizedUsers/${userData.uid}`);
        await set(userRef, null);
      }
      
      // إزالة من قائمة البريد الإلكتروني
      await set(emailRef, null);
      
      console.log("تمت إزالة المستخدم من قائمة المصرح لهم بنجاح");
      return true;
    }
    
    console.warn("المستخدم غير موجود في قائمة المصرح لهم");
    return false;
  } catch (error) {
    console.error("خطأ في إزالة المستخدم من قائمة المصرح لهم:", error);
    return false;
  }
};