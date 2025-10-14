import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  DocumentReference,
  DocumentData,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Firestore documents
export interface ChequeData {
  number: string;
  amount: string;
}

export interface RegistrationDocument {
  name: string;
  idNumber: string;
  phone: string;
  chequeCount: string;
  cheques: ChequeData[];
  bank: string;
  employeeReceiver: string;
  signatureURL?: string;
  signatureData?: string; // Base64 data URL
  typedName?: string;
  registrationNumber: number;
  createdAt: unknown; // serverTimestamp
  pdfUrls: {
    receipt?: string;
    declaration?: string;
  };
  totalAmount: number;
}

export interface SaveRegistrationResult {
  success: boolean;
  docId?: string;
  error?: string;
}

/**
 * Save registration data to Firestore collection
 */
export async function saveRegistrationToFirestore(
  formData: Record<string, unknown>,
  registrationNumber: number,
  pdfUrls: { receipt?: string; declaration?: string }
): Promise<SaveRegistrationResult> {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    // Calculate total amount
    const cheques = formData.cheques as ChequeData[];
    const totalAmount = cheques.reduce((sum: number, cheque: ChequeData) => {
      const amount = parseFloat(cheque.amount.replace(/,/g, '')) || 0;
      return sum + amount;
    }, 0);

    // Prepare document data
    const registrationDoc: Omit<RegistrationDocument, 'createdAt'> = {
      name: formData.bidderName as string,
      idNumber: formData.idNumber as string,
      phone: formData.phoneNumber as string,
      chequeCount: formData.checkCount as string,
      cheques: cheques,
      bank: formData.issuingBank as string,
      employeeReceiver: formData.employeeName as string,
      signatureData: (formData.signature as string) || undefined,
      typedName: (formData.typedName as string) || undefined,
      registrationNumber,
      pdfUrls,
      totalAmount
    };

    // Add document to Firestore
    const docRef: DocumentReference<DocumentData> = await addDoc(
      collection(db, 'مزادات_registrations'),
      {
        ...registrationDoc,
        createdAt: serverTimestamp()
      }
    );

    console.log('✅ Registration saved to Firestore:', docRef.id);
    
    return {
      success: true,
      docId: docRef.id
    };

  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get recent registrations from Firestore
 */
export async function getRecentRegistrations(limitCount: number = 10) {
  try {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const q = query(
      collection(db, 'مزادات_registrations'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const registrations: Array<RegistrationDocument & { id: string }> = [];

    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      } as RegistrationDocument & { id: string });
    });

    return registrations;
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    throw error;
  }
}

/**
 * Generate a unique registration number (1-200)
 */
const usedRegistrationNumbers = new Set<number>();

export function generateUniqueRegistrationNumber(): number {
  // If all numbers are used, clear the set to prevent infinite loop
  if (usedRegistrationNumbers.size >= 200) {
    usedRegistrationNumbers.clear();
  }

  let registrationNumber: number;
  do {
    registrationNumber = Math.floor(Math.random() * 200) + 1;
  } while (usedRegistrationNumbers.has(registrationNumber));

  usedRegistrationNumbers.add(registrationNumber);
  return registrationNumber;
}

/**
 * Format registration data for display
 */
export function formatRegistrationForDisplay(registration: RegistrationDocument & { id: string }) {
  return {
    id: registration.id,
    name: registration.name,
    idNumber: registration.idNumber,
    phone: registration.phone,
    registrationNumber: registration.registrationNumber,
    totalAmount: registration.totalAmount,
    chequeCount: registration.chequeCount,
    bank: registration.bank,
    employeeReceiver: registration.employeeReceiver,
    createdAt: (registration.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    pdfUrls: registration.pdfUrls
  };
}
