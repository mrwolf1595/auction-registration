// Local storage fallback for testing when Firebase is not available
import { Registration, Auction } from './database';

const STORAGE_KEYS = {
  AUCTIONS: 'local_auctions',
  REGISTRATIONS: 'local_registrations'
};

// Auctions
export const getLocalAuctions = (): Auction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUCTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting local auctions:', error);
    return [];
  }
};

export const saveLocalAuction = (auction: Omit<Auction, 'id'>): string => {
  try {
    const auctions = getLocalAuctions();
    const newAuction: Auction = {
      ...auction,
      id: `local_${Date.now()}`
    };
    
    auctions.push(newAuction);
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
    return newAuction.id;
  } catch (error) {
    console.error('Error saving local auction:', error);
    throw new Error('فشل في حفظ المزاد محلياً');
  }
};

// Registrations
export const getLocalRegistrations = (): Registration[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting local registrations:', error);
    return [];
  }
};

export const saveLocalRegistration = (registration: Omit<Registration, 'id'>): string => {
  try {
    const registrations = getLocalRegistrations();
    const newRegistration: Registration = {
      ...registration,
      id: `local_${Date.now()}`,
      registrationDate: new Date().toISOString()
    };
    
    registrations.push(newRegistration);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    return newRegistration.id;
  } catch (error) {
    console.error('Error saving local registration:', error);
    throw new Error('فشل في حفظ التسجيل محلياً');
  }
};

export const updateLocalRegistrationStatus = (
  registrationId: string, 
  status: 'pending' | 'completed',
  completedBy?: string
): void => {
  try {
    const registrations = getLocalRegistrations();
    const index = registrations.findIndex(reg => reg.id === registrationId);
    
    if (index !== -1) {
      registrations[index].status = status;
      if (status === 'completed') {
        registrations[index].completedBy = completedBy;
        registrations[index].completedAt = new Date().toISOString();
      }
      
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    }
  } catch (error) {
    console.error('Error updating local registration:', error);
    throw new Error('فشل في تحديث التسجيل محلياً');
  }
};
