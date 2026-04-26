import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc,
  writeBatch,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { CommunityNeed, Volunteer, VolunteerMatch } from '../types';

export { writeBatch, collection, doc };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key-for-build',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy-app-id',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper functions for Collections
const NEEDS_COLLECTION = 'needs';
const VOLUNTEERS_COLLECTION = 'volunteers';
const MATCHES_COLLECTION = 'matches';

// Generic converter to attach the document ID automatically
const createConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T): DocumentData => {
    // Avoid writing the ID to the document body itself
    const { id: _id, ...rest } = data as any;
    return rest;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
    const data = snapshot.data(options);
    
    // Helper to recursively convert Timestamps to Dates
    const convertTimestamps = (obj: any): any => {
      if (obj instanceof Timestamp) return obj.toDate();
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          acc[key] = convertTimestamps(value);
          return acc;
        }, {} as any);
      }
      if (Array.isArray(obj)) return obj.map(convertTimestamps);
      return obj;
    };

    return { id: snapshot.id, ...convertTimestamps(data) } as unknown as T;
  }
});

const needsConverter = createConverter<CommunityNeed>();
const volunteersConverter = createConverter<Volunteer>();
const matchesConverter = createConverter<VolunteerMatch>();

// --- Needs ---
export async function getNeeds(): Promise<CommunityNeed[]> {
  const needsRef = collection(db, NEEDS_COLLECTION).withConverter(needsConverter);
  const snapshot = await getDocs(needsRef);
  return snapshot.docs.map(doc => doc.data());
}

export async function getNeedById(id: string): Promise<CommunityNeed | null> {
  const needRef = doc(db, NEEDS_COLLECTION, id).withConverter(needsConverter);
  const snapshot = await getDoc(needRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createNeed(needData: Omit<CommunityNeed, 'id' | 'createdAt'>): Promise<string> {
  const needsRef = collection(db, NEEDS_COLLECTION);
  const docRef = await addDoc(needsRef, {
    ...needData,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateNeed(id: string, updates: Partial<Omit<CommunityNeed, 'id'>>): Promise<void> {
  const needRef = doc(db, NEEDS_COLLECTION, id);
  await updateDoc(needRef, updates as DocumentData);
}

// --- Volunteers ---
export async function getVolunteers(): Promise<Volunteer[]> {
  const volunteersRef = collection(db, VOLUNTEERS_COLLECTION).withConverter(volunteersConverter);
  const snapshot = await getDocs(volunteersRef);
  return snapshot.docs.map(doc => doc.data());
}

export async function getVolunteerById(id: string): Promise<Volunteer | null> {
  const volRef = doc(db, VOLUNTEERS_COLLECTION, id).withConverter(volunteersConverter);
  const snapshot = await getDoc(volRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createVolunteer(volunteerData: Omit<Volunteer, 'id' | 'createdAt'>): Promise<string> {
  const volunteersRef = collection(db, VOLUNTEERS_COLLECTION);
  const docRef = await addDoc(volunteersRef, {
    ...volunteerData,
    createdAt: new Date(),
  });
  return docRef.id;
}

// --- Matches ---
export async function getMatches(): Promise<VolunteerMatch[]> {
  const matchesRef = collection(db, MATCHES_COLLECTION).withConverter(matchesConverter);
  const snapshot = await getDocs(matchesRef);
  return snapshot.docs.map(doc => doc.data());
}

export async function createMatch(matchData: Omit<VolunteerMatch, 'id' | 'createdAt'>): Promise<string> {
  const matchesRef = collection(db, MATCHES_COLLECTION);
  const docRef = await addDoc(matchesRef, {
    ...matchData,
    createdAt: new Date(),
  });
  return docRef.id;
}
