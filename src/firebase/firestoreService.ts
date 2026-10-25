import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './config';
import { ClinicInfo } from '../config/clinicSettings';

export interface AppointmentRecord {
  id: string;
  patientName: string;
  mobileNumber: string;
  preferredDate: string;
  preferredTime?: string;
  reason?: string;
  consentGranted: boolean;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationRecord {
  id: string;
  sessionType: 'Chat' | 'Voice Call';
  patientName?: string;
  mobileNumber?: string;
  transcript: string;
  summary?: string;
  enquiryCategory?: string;
  consentGranted: boolean;
  consentVersion: string;
  followUpStatus: 'new' | 'contacted' | 'appointment_requested' | 'completed' | 'closed';
  callDuration?: string;
  language?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const APPOINTMENTS_COLLECTION = 'appointments';
const CONVERSATIONS_COLLECTION = 'conversations';
const SETTINGS_COLLECTION = 'clinicSettings';
const ADMINS_COLLECTION = 'admins';

/**
 * Remove undefined values to prevent Firestore SDK throws
 */
function cleanRecord<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Submit a new appointment request (Public with validation)
 */
export async function createAppointment(
  data: Omit<AppointmentRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: AppointmentRecord = cleanRecord({
    ...data,
    id,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  });

  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await setDoc(docRef, record);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

/**
 * Record a conversation (Chat or Voice Call)
 */
export async function createConversationRecord(
  data: Omit<ConversationRecord, 'id' | 'followUpStatus' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: ConversationRecord = cleanRecord({
    ...data,
    id,
    followUpStatus: 'new',
    createdAt: now,
    updatedAt: now,
  });

  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    await setDoc(docRef, record);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${CONVERSATIONS_COLLECTION}/${id}`);
  }
}

/**
 * Get all appointments (Admin only)
 */
export async function getAppointments(): Promise<AppointmentRecord[]> {
  try {
    const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as AppointmentRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, APPOINTMENTS_COLLECTION);
  }
}

/**
 * Update appointment status & notes (Admin only)
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentRecord['status'],
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    const updates: Partial<AppointmentRecord> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

/**
 * Delete an appointment (Admin only)
 */
export async function deleteAppointment(id: string): Promise<void> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${APPOINTMENTS_COLLECTION}/${id}`);
  }
}

/**
 * Get all conversations (Admin only)
 */
export async function getConversations(): Promise<ConversationRecord[]> {
  try {
    const q = query(collection(db, CONVERSATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as ConversationRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CONVERSATIONS_COLLECTION);
  }
}

/**
 * Update conversation follow-up status (Admin only)
 */
export async function updateConversationStatus(
  id: string,
  followUpStatus: ConversationRecord['followUpStatus'],
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    const updates: Partial<ConversationRecord> = {
      followUpStatus,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONVERSATIONS_COLLECTION}/${id}`);
  }
}

/**
 * Delete a conversation record (Admin only)
 */
export async function deleteConversation(id: string): Promise<void> {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONVERSATIONS_COLLECTION}/${id}`);
  }
}

/**
 * Fetch live clinic settings document (Public read)
 */
export async function getClinicSettingsDoc(): Promise<Partial<ClinicInfo> | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<ClinicInfo>;
    }
    return null;
  } catch (error) {
    // If settings not yet created, return null gracefully
    return null;
  }
}

/**
 * Save clinic settings document (Admin only)
 */
export async function saveClinicSettingsDoc(settings: Partial<ClinicInfo>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'default');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/default`);
  }
}

/**
 * Check if the user has admin role
 */
export async function checkIsUserAdmin(uid: string, email?: string | null): Promise<boolean> {
  // Bootstrapped admin email check
  if (email && email.toLowerCase() === 'zrrnikhilsahu@gmail.com') {
    return true;
  }

  try {
    const docRef = doc(db, ADMINS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (error) {
    return false;
  }
}
