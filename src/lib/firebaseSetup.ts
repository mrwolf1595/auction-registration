'use client';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Helper function to create employee users
export const createEmployeeUser = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase لم يتم تهيئته بشكل صحيح');
  }

  try {
    console.log('Creating user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-in-use') {
      console.log('User already exists, attempting to sign in...');
      try {
        const signInResult = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully:', signInResult.user.uid);
        return signInResult.user;
      } catch (signInError) {
        console.error('Error signing in existing user:', signInError);
        throw signInError;
      }
    }
    throw error;
  }
};

// Setup function to create default employees
export const setupDefaultEmployees = async () => {
  const defaultEmployees = [
    { email: 'nassermessi33@gmail.com', password: 'Mazaad2024!' },
    { email: 'mrv2194@gmail.com', password: 'Mazaad2024!' }
  ];

  console.log('Setting up default employees...');
  
  for (const employee of defaultEmployees) {
    try {
      await createEmployeeUser(employee.email, employee.password);
      console.log(`✅ Employee ${employee.email} is ready`);
    } catch (error) {
      console.error(`❌ Failed to setup employee ${employee.email}:`, error);
    }
  }
};

// Test Firebase connection
export const testFirebaseConnection = () => {
  console.log('Testing Firebase connection...');
  console.log('Auth object:', !!auth);
  console.log('Auth domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  if (!auth) {
    console.error('❌ Firebase Auth is not initialized');
    return false;
  }
  
  console.log('✅ Firebase Auth is initialized');
  return true;
};
